import axios, {isCancel, AxiosError} from 'axios';

import {roll} from './project_modules/dice.mjs'
import {addUp} from './project_modules/addUp.mjs'

// const rolls =  roll(20, 10)
const apiURL = 'https://www.dnd5eapi.co/api/'
const charStats = []
const charLevel = 1
const stats = {
    "DEX": 0,
    "STR": 0,
    "CON": 0,
    "INT": 0,
    "CHA": 0,
    "WIS": 0
}
let charRace
let raceAttr = []
let classAttr = []
let skills = [
    {"name": "Athletics", "parent": "STR", "Modifier": 0},
    {"name": "Acrobatics", "parent": "DEX", "Modifier": 0},
    {"name": "Sleight of Hand", "parent": "DEX", "Modifier": 0},
    {"name": "Stealth", "parent": "DEX", "Modifier": 0},
    {"name": "Arcana", "parent": "INT", "Modifier": 0},
    {"name": "History", "parent": "INT", "Modifier": 0},
    {"name": "Investigation", "parent": "INT", "Modifier": 0},
    {"name": "Nature", "parent": "INT", "Modifier": 0},
    {"name": "Religion", "parent": "INT", "Modifier": 0},
    {"name": "Animal Handling", "parent": "WIS", "Modifier": 0},
    {"name": "Insight", "parent": "WIS", "Modifier": 0},
    {"name": "Medicine", "parent": "WIS", "Modifier": 0},
    {"name": "Perception", "parent": "WIS", "Modifier": 0},
    {"name": "Survival", "parent": "WIS", "Modifier": 0},
    {"name": "Deception", "parent": "CHA", "Modifier": 0},
    {"name": "Intimidation", "parent": "CHA", "Modifier": 0},
    {"name": "Performance", "parent": "CHA", "Modifier": 0},
    {"name": "Persuasion", "parent": "CHA", "Modifier": 0}
]


charGen()

// Steps
    async function charGen() {
        // Choose a race
        await retrieve('races','Race')

        // Get Race Attributes
        await retrieve(`races/${charRace}`, 'Attributes')
    
        // Choose a class
        await retrieve('classes','Class')
    
        // Choose a class
        // BUG - API only has acolyte, need alternative
        await retrieve('backgrounds','Background')

        // Ability Scores
        await abilities()

        // Skill Modifiers
        await modifiers()
    
        console.table(charStats)
    }

    async function abilities() {
        const raceBonuses = raceAttr.ability_bonuses
        let statBonuses = {}
        if (raceBonuses) {
            for (const obj of raceBonuses.entries()) {
                statBonuses[obj[1].ability_score.name] = obj[1].bonus
            }
        }
        for (let stat in stats){
            const dice = roll(6,4)
            dice.sort()
            dice.splice(0,1)
            let total = addUp(dice)
            stats[stat] = total
            if (statBonuses[stat]) {
                stats[stat] += statBonuses[stat]
            }
            charStats.push({"Attribute": stat, "Result": total})
        }
    }


    async function retrieve(endPoint, title) {
        await axios.get(`${apiURL}${endPoint}`)
            .then(function (response) {
                const data = response.data
                if (title === 'Attributes') {
                    raceAttr = data
                } else {
                    const count = data.count
                    const results = data.results
                    const index = roll(count,1)
                    let outcome = results[index[0] - 1].index
                    if (endPoint === 'races') {
                        charRace = outcome
                    }
                    // handle success
                    charStats.push({"Attribute": title, "Result": outcome});
                }
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
    }

    async function modifiers() {
        let proficient = roll(skills.length, 2)
        for (const [ind, skill] of skills.entries()) {
            let parent = skill.parent
            let modifier = -5 + Math.floor(stats[parent] / 2)
            if (proficient.includes(ind)) {
                modifier += Math.floor(2 + ((charLevel - 1) / 4))
            }
            skill.Modifier = new Intl.NumberFormat("en-US", {
                signDisplay: "exceptZero"
            }).format(modifier);
            charStats.push({"Attribute": skill.name, "Result": skill.Modifier});
        }
    }