export function calculateValue(value, weight){
    const frete = calculateFrete(weight)
    const finalValue = frete + value;
    return finalValue;
}
export function calculateFrete(weight){
     let finalValue;
    let weightValue;
    if(weight >= 5 && weight < 20){
        weightValue = (weight - 5) * 2;
        finalValue = weightValue + 15;
    }
    else if(weight > 20){
        weightValue = (weight - 5) * 5;
        finalValue = weightValue + 15;
    }
    else{
        finalValue = 15;
    }
    return finalValue;
}