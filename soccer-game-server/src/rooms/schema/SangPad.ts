import { Schema, type } from "@colyseus/schema";

export class SangPad extends Schema {   
    @type("string") uId!: string;
    @type("number") sangPadX!: number;
    @type("number") sangPadY!: number;
    @type("number") sangPadAngle!: number;
    @type("number") sangPadDis!: number;
}