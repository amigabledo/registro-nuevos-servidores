import { createClient } from '@supabase/supabase-js';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

async function runBackup() {
  console.log("Iniciando respaldo de Supabase Storage a R2 para VentaMerch...");

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Faltan credenciales de Supabase");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
  const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
  const r2Endpoint = process.env.R2_ENDPOINT_URL;
  const r2Bucket = process.env.R2_STORAGE_BUCKET || "merch-storage-backups";

  if (!r2AccessKey || !r2SecretKey || !r2Endpoint) {
    console.error("Faltan credenciales de Cloudflare R2");
    process.exit(1);
  }

  const s3 = new S3Client({
    region: 'auto',
    endpoint: r2Endpoint,
    credentials: {
      accessKeyId: r2AccessKey,
      secretAccessKey: r2SecretKey,
    }
  });

  try {
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) throw bucketError;

    console.log(`Encontrados ${buckets.length} buckets en Supabase.`);

    for (const bucket of buckets) {
      if (bucket.name === "productos") {
         console.log(`Procesando bucket: ${bucket.name}`);
         await processFolder(supabase, s3, bucket.name, '', r2Bucket);
      }
    }
    
    console.log("¡Respaldo de Storage completado exitosamente!");
  } catch (err) {
    console.error("Error global durante el respaldo:", err);
    process.exit(1);
  }
}

async function processFolder(supabase, s3, bucketName, folderPath, r2Bucket) {
  const { data, error } = await supabase.storage.from(bucketName).list(folderPath, {
    limit: 1000,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' }
  });

  if (error) {
    console.error(`Error listando carpeta ${folderPath} en ${bucketName}:`, error);
    return;
  }

  for (const item of data) {
    // ignorar carpeta vacía "placeholder"
    if (item.name === '.emptyFolderPlaceholder') continue;
    
    const currentPath = folderPath ? `${folderPath}/${item.name}` : item.name;

    if (!item.id) {
      // Es una subcarpeta
      await processFolder(supabase, s3, bucketName, currentPath, r2Bucket);
    } else {
      // Es un archivo real
      try {
        const { data: fileData, error: downloadError } = await supabase.storage.from(bucketName).download(currentPath);
        if (downloadError) throw downloadError;

        // Subir a R2 usando stream
        const r2Key = `${bucketName}/${currentPath}`;
        
        const upload = new Upload({
          client: s3,
          params: {
            Bucket: r2Bucket,
            Key: r2Key,
            Body: Buffer.from(await fileData.arrayBuffer()),
            ContentType: item.metadata?.mimetype || 'application/octet-stream',
          }
        });

        await upload.done();
        console.log(`✓ Respaldado: ${r2Key}`);
      } catch (err) {
        console.error(`X Error respaldando ${currentPath}:`, err.message);
      }
    }
  }
}

runBackup();
