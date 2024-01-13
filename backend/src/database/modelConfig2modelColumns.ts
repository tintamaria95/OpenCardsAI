import { DataTypes } from "sequelize";

type ExtractValues<T> = {
    [K in keyof T]: T[K] extends { type: infer U } ? U : never;
};
type ConvertToString<T> = {
    [K in keyof T]: T[K] extends DataTypes.StringDataTypeConstructor ? string : T[K];
};
type ConvertToBoolean<T> = {
    [K in keyof T]: T[K] extends DataTypes.AbstractDataTypeConstructor ? boolean : T[K];
};
type ConvertToNumber<T> = {
    [K in keyof T]: T[K] extends DataTypes.NumberDataTypeConstructor ? number : T[K];
};

type T1<T> = ExtractValues<T>
type T2<T> = ConvertToString<T1<T>>
type T3<T> = ConvertToNumber<T2<T>>
type ModelColumns<ModelConfig> = ConvertToBoolean<T3<ModelConfig>>

export { ModelColumns }