import { useCallback, useEffect, useEffectEvent, useRef } from "react";

export function useIntervalWhen(
	cb: () => void,
	{
		ms,
		condition,
		startImmediately = true,
	}: { ms: number; condition: boolean; startImmediately?: boolean },
) {
	const id = useRef<number | undefined>(undefined);
	const onTick = useEffectEvent(cb);
	const immediatelyCalled = useRef(startImmediately === true ? false : null);

	const handleClearInterval = useCallback(() => {
		window.clearInterval(id.current);
		immediatelyCalled.current = false;
	}, []);

	useEffect(() => {
		if (condition === true) {
			id.current = window.setInterval(onTick, ms);

			if (startImmediately === true && immediatelyCalled.current === false) {
				onTick();
				immediatelyCalled.current = true;
			}

			return handleClearInterval;
		}
	}, [ms, condition, startImmediately, handleClearInterval]);

	return handleClearInterval;
}
