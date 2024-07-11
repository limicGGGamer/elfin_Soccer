import { Schema, type } from "@colyseus/schema";

export class Ball extends Schema { 
    @type("string") uId!: string;
    @type("number") posX!: number;
    @type("number") posY!: number;
    @type("number") angle!: number;
    @type("boolean") visible!: boolean;
}