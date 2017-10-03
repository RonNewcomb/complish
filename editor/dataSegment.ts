module DataSegment {
    export const LitStringPlaceholderPrefix = "__litstring";

    /// <summary>This is the string table. It'll be outputted to the runtime almost as-is.
    /// The runtime puts the length of the string in front of it.</summary>
    var LiteralStrings = <string[]>[];

    export function LiftLiteralStrings(input: string): string {
        while (input.indexOf('"') > -1) {
            var from: number = input.indexOf('"');
            var endAt: number = from + 1;
            endAt += input.substring(endAt).indexOf('"');
            while (input.length > endAt + 1 && input.charAt(endAt + 1) == '"') {
                endAt += 2 + input.substring(endAt).indexOf('"');
            }
            var len:number = endAt - (from + 1);
            var literal:string = input.substring(from + 1, len);
            input = input.substring(0, from - 1) + " " + LitStringPlaceholderPrefix + LiteralStrings.length + " " + input.substring(endAt + 1);
            LiteralStrings.push(literal.replace(/""/g, '"'));
        }
        return input;
    }

    export function GetLiteralStringFor(placeholder: string): string {
        return LiteralStrings[parseInt(placeholder.replace(LitStringPlaceholderPrefix, ""))];
    }

}