export default function slow() {
    let currentTime = new Date().getTime();
    while (currentTime + 2000 >= new Date().getTime()) {}
}