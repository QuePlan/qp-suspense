import { Injectable } from '@angular/core';

/**
 * Enum para definir la prioridad de las tareas.
 * Permite utilizar alias un poco más simples y descriptivos, en caso que se requiera.
 */
const enum taskPriority {
  BACKGROUND    = 'background',
  USER_VISIBLE  = 'user-visible',
  USER_BLOCKING = 'user-blocking',
  LOW           = 'background',
  MEDIUM        = 'user-visible',
  HIGH          = 'user-blocking',
};

/**
 * Servicio que permite ejecutar tareas en segundo plano, sin bloquear la UI.
 * Está definido como un servicio de funciones estáticas, de modo de poder ser ejecutyado sin necesidad de inyectarlo.
 * @see https://web.dev/optimize-long-tasks
 */
@Injectable({
  providedIn: 'root'
})
export class YieldToMainService {

  constructor() { }

  /**
   * "Produce" la ejecución de una tarea en segundo plano, sin bloquear la UI.
   * @returns {Promise<T>} promesa que se resuelve cuando se haya ejecutado la tarea.
   */
  static yieldToMain<T> () {
    return new Promise<T>(resolve => {
      setTimeout(resolve, 0);
    });
  }

  /**
   * Recorre el arreglo de tareas y las ejecuta en segundo plano, sin bloquear la UI.
   * @param tasks {Array<() => void>} Arreglo de las funciones que se ha identificado como tareas que pueden ser ejecutadas en segundo plano.
   * @param watchUserInput {boolean} Indica si se debe vigilar la entrada del usuario. Si es true, se vigilará la entrada del usuario y se 
   *                                 verificará si hay entrada de datos pendientes previo "producir" la ejecución (yieldToMain).
   */
  static async yieldTaskArray(tasks: Array<() => void>, watchUserInput = false) {
    while (tasks.length > 0) {
      if(watchUserInput) {
        // Yield to a pending user input:
        if ((navigator as any)['scheduling'].isInputPending()) {
          // There's a pending user input. Yield here:
          await YieldToMainService.yieldToMain();
        } else {
          // Shift the task out of the queue:
          const task = tasks?.shift();
    
          // Run the task:
          if (task) task();
        }
      } else {
        // Shift the first task off the tasks array:
        const task = tasks.shift();

        // Run the task:
        if (task) task();

        // Yield to the main thread:
        await YieldToMainService.yieldToMain();
      }
    }
  }

  /**
   * Permite la ejecución de una tarea en segundo plano, asignándole una prioridad, sin bloquear la UI.
   * @param task {() => void} tarea a ejecutar
   * @param priority {taskPriority} prioridad de la tarea. Por defecto es MEDIUM
   * @returns {Promise<T>} promesa que se resuelve cuando la tarea se haya ejecutado
   */
  static prioritizeTask<T>(task: () => void, priority: taskPriority = taskPriority.MEDIUM): Promise<T>{
    let result;

    // Si el navegador soporta la API de scheduling, se utiliza para ejecutar la tarea en segundo plano, con la prioridad indicada.
    if ('scheduler' in window) {
      result = (window as any)['scheduler'].postTask(task, { priority });
    } else {
      task();
      result = YieldToMainService.yieldToMain();
    }

    return result;    
  }
}
