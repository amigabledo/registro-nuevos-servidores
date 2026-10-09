const { Client } = require('pg');

const sql = `
create table if not exists public.presentaciones_ninos (
  id uuid primary key default gen_random_uuid(),
  nombre_nino text not null,
  fecha_nacimiento date not null,
  edad_nino text not null,
  nombre_padre text not null,
  telefono_padre text not null,
  nombre_madre text not null,
  telefono_madre text not null,
  notas text,
  estado text not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_presentaciones_ninos_created_at on public.presentaciones_ninos (created_at desc);
create index if not exists idx_presentaciones_ninos_estado on public.presentaciones_ninos (estado);
create index if not exists idx_presentaciones_ninos_nombre on public.presentaciones_ninos (nombre_nino);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'tr_presentaciones_ninos_updated_at'
  ) then
    create trigger tr_presentaciones_ninos_updated_at
      before update on public.presentaciones_ninos
      for each row
      execute function public.update_updated_at_column();
  end if;
end
$$;

alter table public.presentaciones_ninos enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'presentaciones_ninos' and policyname = 'Permitir insercion anonima'
  ) then
    create policy "Permitir insercion anonima"
      on public.presentaciones_ninos for insert
      to anon
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'presentaciones_ninos' and policyname = 'Permitir todo a usuarios autenticados'
  ) then
    create policy "Permitir todo a usuarios autenticados"
      on public.presentaciones_ninos for all
      to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'presentaciones_ninos' and policyname = 'Permitir todo al rol service_role'
  ) then
    create policy "Permitir todo al rol service_role"
      on public.presentaciones_ninos for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;

grant insert on public.presentaciones_ninos to anon;
grant select, insert, update, delete on public.presentaciones_ninos to authenticated;
grant select, insert, update, delete on public.presentaciones_ninos to service_role;
`;

const connectionString = process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING;
if (!connectionString) {
  console.error('Error: Debe configurar la variable de entorno DATABASE_URL o DB_CONNECTION_STRING.');
  process.exit(1);
}

const client = new Client({
  connectionString,
});

async function main() {
  await client.connect();
  console.log('Conectado a Supabase PostgreSQL');
  await client.query(sql);
  console.log('Tabla presentaciones_ninos creada con éxito en Supabase.');
  await client.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
