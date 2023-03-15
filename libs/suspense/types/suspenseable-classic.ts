import { ObservableInput } from "rxjs";
import { ISuspenseable, SuspenseableRenderer } from "./types";

/**
 * Definición de la clase abstracta que permite implementar un componente de tipo Suspenseable en su modo de 
 * operación "normal" (usando  función `setup()`), es decir un componente se entenderá *en estado listo para ser desplegado* 
 * cuando la función setup se haya ejecutado sin errores.
 * Se forzará la implementación de la función `setup()` para este subtipo de componentes Suspenseable.
 */
export abstract class SuspenseableClassic extends SuspenseableRenderer implements Pick<ISuspenseable, 'setup'> {
  abstract setup(): ObservableInput<any>;
}