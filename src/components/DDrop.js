import React, { useState, useEffect } from "react";

const DDrop = ({ children, onDrop, maxShift, minShift }) => {
    const [captured, setCaptured] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [dX, setDX] = useState(0);
    const [dY, setDY] = useState(0);
    let rootElement;
    const onTouchStart = e => {
        const { clientX, clientY } = e.targetTouches[0];
        const { target } = e;
        onMouseDown({ clientX, clientY, target });
        // e.preventDefault();
    };
    const onTouchMove = e => {
        const { clientX, clientY } = e.targetTouches[0];
        const { target } = e;
        onMouseMove({ clientX, clientY, target });
        e.preventDefault();
    };
    const onMouseDown = e => {
        const { target, clientX, clientY, pointerId } = e;
        if (target.tagName.toLowerCase() == "select") {
            return;
        }
        if (pointerId) {
            target.setPointerCapture(pointerId);
        }
        setCaptured(true);
        setStartX(clientX);
        setStartY(clientY);
        setDX(0);
        setDY(0);
        if (
            typeof e === "object" &&
            e !== null &&
            typeof e.stopPropagation === "function"
        ) {
            e.stopPropagation();
        }
    };
    const onMouseMove = e => {
        const { clientX, clientY } = e;
        const min = minShift || 10;
        if (captured) {
            const shiftX = Math.abs(clientX - startX);
            const shiftY = Math.abs(clientY - startY);
            if (shiftX > min && shiftX < maxShift) {
                setDX(clientX - startX);
            }
            if (shiftY > min && shiftY < maxShift) {
                setDY(clientY - startY);
            }
            e.stopPropagation();
        }
    };
    const onMouseUp = e => {
        const { target, pointerId } = e;
        if (pointerId) {
            target.releasePointerCapture(pointerId);
        }
        onDrop({ dX, dY });
        setDX(0);
        setDY(0);
        e.stopPropagation();
        setCaptured(false);
    };
    useEffect(() => {
        rootElement.addEventListener("touchstart", onTouchStart, {
            passive: false
        });
        rootElement.addEventListener("touchmove", onTouchMove, {
            passive: false
        });
        rootElement.addEventListener("touchend", onMouseUp, { passive: false });
        return () => {
            rootElement.removeEventListener("touchstart", onTouchStart);
            rootElement.removeEventListener("touchmove", onTouchMove);
            rootElement.removeEventListener("touchend", onMouseUp);
        };
    }, []);
    return (
        <div
            className="DDrop"
            ref={ref => {
                rootElement = ref;
            }}
            // onTouchStart={onTouchStart}
            // onTouchMove={onMouseMove}
            // onTouchEnd={onMouseUp}
            onPointerDown={onMouseDown}
            onPointerMove={onMouseMove}
            onPointerUp={onMouseUp}
        >
            {children({ dX, dY })}
        </div>
    );
};

export default DDrop;
