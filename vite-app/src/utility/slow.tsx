export default function slow() {
    const currentTime = new Date().getTime();
    while (currentTime + 2000 >= new Date().getTime()) { /* busy wait */ }
}