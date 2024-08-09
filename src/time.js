/** YYYY-MM-DD HH:MM:SS를 YYYY년 MM월 DD일 HH시 MM분 SS초 형식으로 변환합니다. */
export function format1(time) {
    var year = time.slice(0,4);

    var full = `${year}년`
    return full
}
export default function mon_day(time) {
    return `${time.slice(5, 7)}월 ${time.slice(8, 10)}일 ${time.slice(11, 13)}시 ${time.slice(14, 16)}분`
}