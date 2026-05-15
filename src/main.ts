import * as ZPE from "@/zpe-port";
import { init, run, unload, destroy } from "./app";

export default ZPE.create(init, run, unload, destroy);