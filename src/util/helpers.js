/*!
 * Fast indexOf
 * @param  {Array} arr   The array to search
 * @param  {Mixed} value The value to find
 * @return {Number}       The index OR -1
 */
Physics.util.indexOf = function indexOf(arr, value) {
    var fr = 0, bk = arr.length;
    while (fr < bk) {
        bk--;
        if (arr[ fr ] === value) {
            return fr;
        }
        if (arr[ bk ] === value) {
            return bk;
        }
        fr++;
    }
    return -1;
};
