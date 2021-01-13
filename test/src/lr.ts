import { BigNumber } from "bignumber.js";

type Point = { x: BigNumber; y: BigNumber };

interface LR {
    start: Point;
    end: Point;
    slope: BigNumber;
    intercept: BigNumber;
    duration: BigNumber;
}

const create_lr = (start: Point, end: Point): LR => {
    return {
        start,
        end,
        slope: end.y.minus(start.y).div(end.x.minus(start.x)),
        intercept: start.y,
        duration: end.x.minus(start.y),
    };
};

const lr_y = (lr: LR, x: BigNumber) => {
    if (x.lt(lr.start.x)) {
        throw new Error("lr_y: only positive values");
    }
    if (x.gt(lr.end.x)) {
        return lr.end.y;
    }
    const sinceStart = x.minus(lr.start.x);
    const y = lr.slope.times(sinceStart).plus(lr.intercept);
    return y;
};

const lr_integral = (lr: LR, x0: BigNumber, x1: BigNumber) => {
    const y0 = lr_y(lr, x0);
    const y1 = lr_y(lr, x1);
    const xDiff = x1.minus(x0);
    const y_avg = y0.plus(y1).div(2);
    return xDiff.times(y_avg);
};
