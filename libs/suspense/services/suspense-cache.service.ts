import { Injectable } from '@angular/core';

/**
 * Implementación de servicio de cache en memoria (simple), para las
 * clases asociadas a los componentes lazy que se van a cargar usando qp-suspense
 */
@Injectable({
  providedIn: 'root'
})
export class SuspenseCacheService<T> {
  private clazzMap: Map<string, T> = new Map();

  constructor() { }

  /**
   * Verifica si una clase sen encuentra en el caché.
   * @param clazzName Llave de búsqueda para el rescate de la clase del componente. Nombre de la clase. 
   * @returns true si la clase se encuentra en el caché
   */
  hasClazz(clazzName: string): boolean {
    return this.clazzMap.has(clazzName);
  }

  /**
   * Dado el nombre de un clase, la rescata desde el caché.
   * Supone que previamente se ha hecho una verificación de su existencia.
   * @param clazzName Llave de búsqueda para el rescate de la clase del componente. Nombre de la clase. 
   * @returns Clase asociada al componente a cargar
   */
  getClazz(clazzName: string): T {
    return this.clazzMap.get(clazzName) as T;
  }

  /**
   * Almacena la clase asociada al componente Suspenseable, utilizando el nombre de la clase
   * como llave de búsqueda. 
   * @param clazzName Nombre de la clase, que será usado como llave de búsqeuda/rescate
   * @param clazz Clase (módulo ESM) asociada al componente
   */
  setClazz(clazzName: string, clazz: T) {
    this.clazzMap.set(clazzName, clazz);
  }

  /**
   * Despliega el contenido del caché de clases.
   * Sólo para debug.
   */
  debugClazzMap() {
    console.log(`[QpSuspenseCacheService]`, this.clazzMap);
  }
}
