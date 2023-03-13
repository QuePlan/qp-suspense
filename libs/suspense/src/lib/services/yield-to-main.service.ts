import { Injectable } from '@angular/core';

enum taskPriority {
  BACKGROUND    = 'background',
  USER_VISIBLE  = 'user-visible',
  USER_BLOCKING = 'user-blocking',
  LOW           = 'background',
  MEDIUM        = 'user-visible',
  HIGH          = 'user-blocking',
}

@Injectable({
  providedIn: 'root'
})
export class YieldToMainService {

  constructor() { }

  // Ref https://web.dev/optimize-long-tasks
  static yieldToMain<T> () {
    return new Promise<T>(resolve => {
      setTimeout(resolve, 0);
    });
  }

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

  static prioritizeTask<T>(task: () => void, priority: taskPriority = taskPriority.MEDIUM): Promise<T>{
    let result;
    if ('scheduler' in window) {
      result = (window as any)['scheduler'].postTask(task, { priority });
    } else {
      task();
      result = YieldToMainService.yieldToMain();
    }

    return result;    
  }
}
