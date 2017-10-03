var DataSegment;
(function (DataSegment) {
    DataSegment.LitStringPlaceholderPrefix = "__litstring";
    /// <summary>This is the string table. It'll be outputted to the runtime almost as-is.
    /// The runtime puts the length of the string in front of it.</summary>
    var LiteralStrings = [];
    function LiftLiteralStrings(input) {
        while (input.indexOf('"') > -1) {
            var from = input.indexOf('"');
            var endAt = from + 1;
            endAt += input.substring(endAt).indexOf('"');
            while (input.length > endAt + 1 && input.charAt(endAt + 1) == '"') {
                endAt += 2 + input.substring(endAt).indexOf('"');
            }
            var len = endAt - (from + 1);
            var literal = input.substring(from + 1, len);
            input = input.substring(0, from - 1) + " " + DataSegment.LitStringPlaceholderPrefix + LiteralStrings.length + " " + input.substring(endAt + 1);
            LiteralStrings.push(literal.replace(/""/g, '"'));
        }
        return input;
    }
    DataSegment.LiftLiteralStrings = LiftLiteralStrings;
    function GetLiteralStringFor(placeholder) {
        return LiteralStrings[parseInt(placeholder.replace(DataSegment.LitStringPlaceholderPrefix, ""))];
    }
    DataSegment.GetLiteralStringFor = GetLiteralStringFor;
})(DataSegment || (DataSegment = {}));
