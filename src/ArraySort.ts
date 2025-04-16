declare global {
    interface Array<T> {
        /**
         * Custom sort method that sorts the array based on a provided function and direction
         * @param fn - Function that extracts a number from each element for comparison
         * @param asc - Sort direction (true for ascending, false for descending)
         * @returns A new sorted array
         */
        mySort(fn: (item: T) => number, asc?: boolean): T[];
    }
}

export const mySort = function <T>(this: T[], fn: (item: T) => number, asc = true): T[] {
    return this.toSorted((a: T, b: T) => {
        return (fn(a) - fn(b)) * (asc ? 1 : -1);
    });
};

Array.prototype.mySort = mySort;
