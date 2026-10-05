interface Env {
  GOOGLE_SHEETS_SERVIDORES_URL?: string;
  GOOGLE_SHEETS_PRESENTACION_URL?: string;
  GOOGLE_SHEETS_HOSPEDAJE_URL?: string;
  GOOGLE_SHEETS_VALIJAS_URL?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as {
      target: 'servidores' | 'presentacion' | 'hospedaje' | 'valijas';
      records: unknown[];
    };

    if (!body || !body.target || !Array.isArray(body.records)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Debe especificar el destino ("target") y una lista de registros ("records").',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }

    let webhookUrl: string | undefined;
    if (body.target === 'servidores') {
      webhookUrl = context.env.GOOGLE_SHEETS_SERVIDORES_URL;
    } else if (body.target === 'presentacion') {
      webhookUrl = context.env.GOOGLE_SHEETS_PRESENTACION_URL;
    } else if (body.target === 'hospedaje') {
      webhookUrl = context.env.GOOGLE_SHEETS_HOSPEDAJE_URL;
    } else if (body.target === 'valijas') {
      webhookUrl = context.env.GOOGLE_SHEETS_VALIJAS_URL;
    }

    if (!webhookUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Variable de entorno para "${body.target}" no configurada en Cloudflare Pages.`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }

    const payload = {
      action: 'sync_batch',
      records: body.records,
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const resText = await res.text();
    let resJson: unknown = resText;
    try {
      resJson = JSON.parse(resText);
    } catch {
      // Formato plano
    }

    return new Response(
      JSON.stringify({
        success: true,
        target: body.target,
        total_enviados: body.records.length,
        respuesta_sheets: resJson,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error inesperado durante la sincronización';
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }
};
