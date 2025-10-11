/**
 * Formatea los errores del backend para mostrarlos correctamente
 * Maneja tanto errores simples (strings) como errores de validación de Pydantic (arrays)
 * 
 * @param {*} error - El error capturado del catch
 * @param {string} defaultMessage - Mensaje por defecto si no se puede extraer el error
 * @returns {string} - Mensaje de error formateado
 */
export const formatErrorMessage = (error, defaultMessage = 'Error desconocido') => {
  try {
    const detail = error?.response?.data?.detail;
    
    // Si no hay detail, retornar mensaje por defecto
    if (!detail) {
      return defaultMessage;
    }
    
    // Si detail es un string, retornarlo directamente
    if (typeof detail === 'string') {
      return detail;
    }
    
    // Si detail es un array (error de validación de Pydantic)
    if (Array.isArray(detail)) {
      // Formatear cada error de validación
      const errors = detail.map(err => {
        const location = err.loc ? err.loc.join(' → ') : '';
        const message = err.msg || 'Error de validación';
        return location ? `${location}: ${message}` : message;
      });
      
      // Si hay múltiples errores, mostrarlos en lista
      if (errors.length > 1) {
        return `Errores de validación:\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`;
      }
      
      // Si hay un solo error, mostrarlo directamente
      return errors[0] || defaultMessage;
    }
    
    // Si detail es un objeto (posiblemente un error de validación individual)
    if (typeof detail === 'object' && detail !== null) {
      if (detail.msg) {
        const location = detail.loc ? detail.loc.join(' → ') : '';
        return location ? `${location}: ${detail.msg}` : detail.msg;
      }
      
      // Si el objeto no tiene la estructura esperada, usar el mensaje por defecto
      return defaultMessage;
    }
    
    return defaultMessage;
  } catch (e) {
    console.error('Error al formatear mensaje de error:', e);
    return defaultMessage;
  }
};

/**
 * Extrae el mensaje de error para mostrar en un toast
 * Versión más simple para uso rápido
 */
export const getErrorMessage = (error, defaultMessage = 'Ocurrió un error') => {
  return formatErrorMessage(error, defaultMessage);
};
