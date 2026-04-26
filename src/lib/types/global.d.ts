export {};

declare global {
	export type OmitTyped<Obj extends object, Keys extends keyof Obj> = Omit<
		Obj,
		Keys
	>;
	export type PickTyped<Obj extends object, Keys extends keyof Obj> = Pick<
		Obj,
		Keys
	>;
}
