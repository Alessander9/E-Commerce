const API_BASE_URL = 'http://localhost:3000';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  tenantSlug?: string,
): Promise<T> {
  const token = localStorage.getItem('cleo_auth_token');
  const activeSlug = tenantSlug || localStorage.getItem('cleo_tenant_slug') || 'perucat';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-slug': activeSlug,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await response.json().catch(() => ({}));

    // Interceptor: Handle Unauthorized (401)
    if (response.status === 401) {
      if (token) {
        localStorage.removeItem('cleo_auth_token');
        localStorage.removeItem('cleo_auth_user');
      }
      throw new Error(json.message || 'Sesión expirada o no autorizada');
    }

    // Interceptor: Handle Forbidden (403)
    if (response.status === 403) {
      throw new Error(json.message || 'No tienes permisos jerárquicos para realizar esta acción');
    }

    if (!response.ok || !json.success) {
      throw new Error(json.message || `Error del servidor (${response.status})`);
    }

    return json.data;
  } catch (error: any) {
    throw error;
  }
}

