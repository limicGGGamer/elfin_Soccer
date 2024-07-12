"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
const schema_1 = require("@colyseus/schema");
class Entity extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.name = "Entity name " + Math.random().toString().substring(2, 5);
        this.dead = false;
        this.angle = 0;
        this.speed = 0;
    }
    static distance(a, b) {
        return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    }
}
exports.Entity = Entity;
__decorate([
    (0, schema_1.type)("string")
], Entity.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)("float64")
], Entity.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)("float64")
], Entity.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)("float32")
], Entity.prototype, "radius", void 0);
