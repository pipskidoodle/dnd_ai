export function roll(faces, num) {
    const values = []
    for (let i = 0; i < num; i++){
        values.push(Math.floor(Math.random() * faces + 1))
    }
    return values
}