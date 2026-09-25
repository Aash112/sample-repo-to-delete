"use client"

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react"

import type {
  GlobalOptions as ConfettiGlobalOptions,
  CreateTypes as ConfettiInstance,
  Options as ConfettiOptions,
} from "canvas-confetti"

import confetti from "canvas-confetti"

export type ConfettiRef = {
  fire: (options?: ConfettiOptions) => Promise<void> | void
}

type Props = React.ComponentPropsWithRef<"canvas"> & {
  options?: ConfettiOptions
  globalOptions?: ConfettiGlobalOptions
  manualstart?: boolean
}

export const Confetti = forwardRef<ConfettiRef, Props>(
  (
    {
      options,
      globalOptions = {
        resize: true,
        useWorker: true,
      },
      manualstart = false,
      className,
      ...rest
    },
    ref
  ) => {
    const canvasNodeRef = useRef<HTMLCanvasElement | null>(null)
    const instanceRef = useRef<ConfettiInstance | null>(null)
    const optionsRef = useRef(options)

    useEffect(() => {
      optionsRef.current = options
    }, [options])

    useEffect(() => {
      if (canvasNodeRef.current && !instanceRef.current) {
        instanceRef.current = confetti.create(
          canvasNodeRef.current,
          globalOptions
        )
      }

      return () => {
        instanceRef.current?.reset()
        instanceRef.current = null
      }
    }, [globalOptions])

    const fire = useCallback(
      async (opts: ConfettiOptions = {}) => {
        try {
          await instanceRef.current?.({
            ...optionsRef.current,
            ...opts,
          })
        } catch (error) {
          console.error("Confetti error:", error)
        }
      },
      []
    )

    const api = useMemo<ConfettiRef>(() => ({ fire }), [fire])

    useImperativeHandle(ref, () => api, [api])

    useEffect(() => {
      if (!manualstart) {
        void fire()
      }
    }, [manualstart, fire])

    return (
      <canvas
        ref={canvasNodeRef}
        className={className}
        {...rest}
      />
    )
  }
)

Confetti.displayName = "Confetti"