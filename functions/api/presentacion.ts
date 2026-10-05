interface Env {
  GOOGLE_SHEETS_PRESENTACION_URL?: string;
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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const isConfigured = Boolean(context.env.GOOGLE_SHEETS_PRESENTACION_URL);
  return new Response(
    JSON.stringify({
      status: 'ok',
      endpoint: '/api/presentacion',
      webhook_configurado: isConfigured,
      fecha: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    }
  );
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const webhookUrl = context.env.GOOGLE_SHEETS_PRESENTACION_URL;

    let payload: Record<string, unknown> = {};
    try {
      payload = (await context.request.json()) as Record<string, unknown>;
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Cuerpo de petición inválido o no es JSON.',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }

    if (!webhookUrl) {
      console.warn('Variable GOOGLE_SHEETS_PRESENTACION_URL no configurada en Cloudflare Pages.');
      return new Response(
        JSON.stringify({
          success: true,
          delivered: false,
          message: 'Registro recibido en Cloudflare Pages. Variable GOOGLE_SHEETS_PRESENTACION_URL pendiente de configurar en el panel.',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseData: unknown = responseText;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      // Si la respuesta es texto plano o HTML
    }

    return new Response(
      JSON.stringify({
        success: true,
        delivered: true,
        sheets_response: responseData,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error desconocido al despachar a Google Sheets.';
    console.error('Error en /api/presentacion:', errorMsg);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMsg,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }
};
