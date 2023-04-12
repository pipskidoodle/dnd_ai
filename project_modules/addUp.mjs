export function addUp(dice) {
    let total = 0
    for (let i = 0; i < dice.length; i++){
        total += dice[i]
    }
    return total
}