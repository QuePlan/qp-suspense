import { ObservableInput } from "rxjs";
import { ISuspenseable } from "./types";

export abstract class SuspenseableClassic implements Pick<ISuspenseable, 'setup'> {
  abstract setup(): ObservableInput<any>;
}