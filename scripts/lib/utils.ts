
const sequentialize = <T>(funcs: (() => Promise<T>)[]) => {
    let p: Promise<T[] | void> = Promise.resolve();
    for (const f of funcs) {
        p = p.then((acc) =>
            f().then((out) => {
                if (acc) {
                    acc.push(out);
                    return acc
                }
                return [out];
            })
        );
    }
    return p.then(out => out || []);
};

export { sequentialize };
