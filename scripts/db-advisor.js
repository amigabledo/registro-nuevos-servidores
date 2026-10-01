import pg from 'pg';
const { Client } = pg;
import fs from 'fs';

async function runAdvisor() {
  const connectionString = process.env.DB_CONNECTION_STRING || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("Error: La variable de entorno DB_CONNECTION_STRING o DATABASE_URL no esta configurada.");
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Conectado a PostgreSQL para analisis...");

    let markdownReport = `# Reporte de salud de base de datos\n\nGenerado automaticamente por el DB Advisor.\n\n`;
    let hasIssues = false;

    // 1. Verificar escaneos secuenciales vs escaneos por indice con umbral de cardinalidad
    const tableStatsQuery = `
      SELECT 
        relname, 
        seq_scan, 
        idx_scan, 
        n_live_tup,
        CASE 
          WHEN (seq_scan + COALESCE(idx_scan,0)) = 0 THEN 0 
          ELSE ROUND(100.0 * COALESCE(idx_scan,0) / (seq_scan + COALESCE(idx_scan,0)), 1) 
        END AS idx_hit_pct
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public' AND seq_scan > 1000
      ORDER BY seq_scan DESC 
      LIMIT 15;
    `;
    const { rows: tableStats } = await client.query(tableStatsQuery);

    // Se exige n_live_tup > 500 para evitar falsos positivos en tablas pequenas de catalogo o configuracion
    const problematicTables = tableStats.filter(row => 
      row.idx_hit_pct < 50 && 
      row.seq_scan > 5000 && 
      (row.n_live_tup || 0) > 500
    );
    
    if (problematicTables.length > 0) {
      hasIssues = true;
      markdownReport += `## Alerta: escaneos secuenciales elevados\n`;
      markdownReport += `Las siguientes tablas con cardinalidad relevante estan siendo escaneadas secuencialmente con alta frecuencia. Se requiere agregar indices:\n\n`;
      markdownReport += `| Tabla | Escaneos secuenciales | Escaneos por indice | Acierto por indice (%) | Filas vivas |\n`;
      markdownReport += `|---|---|---|---|---|\n`;
      problematicTables.forEach(t => {
        markdownReport += `| \`${t.relname}\` | ${t.seq_scan} | ${t.idx_scan} | ${t.idx_hit_pct}% | ${t.n_live_tup || 0} |\n`;
      });
      markdownReport += `\n`;
    }

    // 2. Verificar tasa de acierto de memoria cache (Buffer Cache Hit Ratio)
    const bufferQuery = `
      SELECT 
        ROUND(sum(heap_blks_hit) * 100.0 / GREATEST(sum(heap_blks_hit) + sum(heap_blks_read), 1), 2) as buffer_cache_hit_pct 
      FROM pg_statio_user_tables;
    `;
    const { rows: bufferStats } = await client.query(bufferQuery);
    const hitPct = parseFloat(bufferStats[0].buffer_cache_hit_pct);

    if (hitPct < 95) {
      hasIssues = true;
      markdownReport += `## Alerta: tasa de acierto de memoria cache baja\n`;
      markdownReport += `La tasa de acierto actual es de **${hitPct}%**. El valor recomendado es superior al 95%. Considerar optimizar consultas pesadas o revisar el plan de recursos de la base de datos.\n\n`;
    }

    // 3. Verificar consultas pesadas (si pg_stat_statements esta disponible)
    try {
      const slowQueries = `
        SELECT 
          substring(query, 1, 150) AS short_query, 
          calls, 
          ROUND(total_exec_time::numeric, 2) AS total_time_ms, 
          ROUND(mean_exec_time::numeric, 2) AS mean_time_ms
        FROM pg_stat_statements
        JOIN pg_roles r ON r.oid = userid
        WHERE r.rolname = 'authenticator' OR r.rolname = 'postgres'
        ORDER BY total_exec_time DESC 
        LIMIT 5;
      `;
      const { rows: topQueries } = await client.query(slowQueries);
      
      if (topQueries.length > 0) {
        markdownReport += `## Principales cinco consultas mas pesadas (tiempo total)\n\n`;
        markdownReport += `| Consulta | Llamadas | Tiempo total (ms) | Tiempo medio (ms) |\n`;
        markdownReport += `|---|---|---|---|\n`;
        topQueries.forEach(q => {
          markdownReport += `| \`${q.short_query.replace(/\|/g, '').replace(/\n/g, ' ')}...\` | ${q.calls} | ${q.total_time_ms} | ${q.mean_time_ms} |\n`;
        });
        markdownReport += `\n`;
      }
    } catch (e) {
      console.warn("Aviso: No se pudo leer pg_stat_statements.");
    }

    if (hasIssues) {
      console.log("Se detectaron advertencias de rendimiento.");
      console.log(markdownReport);
      
      if (process.env.GITHUB_STEP_SUMMARY) {
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdownReport);
      }
      if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_issues=true\n`);
        fs.writeFileSync('db-report.md', markdownReport);
      }
      process.exit(0);
    } else {
      console.log("Estado saludable. No se detectaron escaneos secuenciales criticos ni degradacion de cache.");
      if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_issues=false\n`);
      }
      process.exit(0);
    }

  } catch (error) {
    console.error("Error ejecutando el analisis:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runAdvisor();
