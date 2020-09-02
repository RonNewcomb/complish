export const LitStringPlaceholderPrefix = "__litstring";
const LiteralStrings = [];
export function LiftLiteralStrings(input) {
    while (input.indexOf('"') > -1) {
        const from = input.indexOf('"');
        let endAt = from + 1;
        endAt += input.substring(endAt).indexOf('"');
        while (input.length > endAt + 1 && input.charAt(endAt + 1) == '"') {
            endAt += 2 + input.substring(endAt).indexOf('"');
        }
        const len = endAt - (from + 1);
        const literal = input.substring(from + 1, len);
        input = input.substring(0, from - 1) + " " + LitStringPlaceholderPrefix + LiteralStrings.length + " " + input.substring(endAt + 1);
        LiteralStrings.push(literal.replace(/""/g, '"'));
    }
    return input;
}
export function GetLiteralStringFor(placeholder) {
    return LiteralStrings[parseInt(placeholder.replace(LitStringPlaceholderPrefix, ""))];
}
