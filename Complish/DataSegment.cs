using System;
using System.Collections.Generic;
using System.Linq;


namespace Complish
{
	public class DataSegment
	{
		public const string LitStringPlaceholderPrefix = "__litstring";

		/// <summary>This is the string table. It'll be outputted to the runtime almost as-is.
		/// The runtime puts the length of the string in front of it.</summary>
		public List<string> LiteralStrings = new List<string>();

		public string LiftLiteralStrings(string input)
		{
			while (input.Contains('"'))
			{
				int from = input.IndexOf('"');
				int endAt = from + 1;
			loopPastDquoteLiteral:
				endAt += input.Substring(endAt).IndexOf('"');
				if (input.Length > endAt + 1 && input.ElementAt(endAt + 1) == '"')
				{
					endAt += 2;
					goto loopPastDquoteLiteral;
				}
				int len = endAt - (from + 1);
				string literal = input.Substring(from + 1, len);
				input = input.Substring(0, from - 1) + String.Format(" {0}{1} ", LitStringPlaceholderPrefix, LiteralStrings.Count) + input.Substring(endAt + 1);
				LiteralStrings.Add(literal.Replace("\"\"", "\""));
			}
			return input;
		}

		public string GetLiteralStringFor(string placeholder)
		{
			return LiteralStrings[int.Parse(placeholder.Replace(LitStringPlaceholderPrefix, ""))];
		}

		/// <summary> Data lives in one of a few places.  The runtime heap, the runtime stack, or here, 
		/// the permanent data segment which holds the global vars and static vars.  The string table 
		/// is also technically within this segment.</summary>
		public static List<Symbol> PermanentDataSegment = new List<Symbol>();

		internal class StackLocation
		{
			public string name;
			public int depth;
			public Parameter inst;
			public StackLocation(string n, int d, Parameter i)
			{ name = n; depth = d; inst = i; }
		}

		// 0) er, traditionally, upon a func call, the previous func's vars temporarily disappear from scope....
		// 1) But didn't an early doc of complish allow referencing anything up the call stack? Meaning, the "current past"?
		// 2) And doesn't the current doc say we can "take" return values from already-returned calls?  The "recent past"?
		// Well, if a func is called from multiple places, the "inherited locals" will be different.

		///// <summary> When parsing the (invocation of) a simple noun, like a variable name or a local parameter name.</summary>
		//public static instance MatchToNamedStackLocation(List<string> words)
		//{
		//	string firstWord = words[index];
		//	if (!scope.ContainsKey(firstWord))
		//		return null;
		//	var possibles = scope[firstWord];
		//	StackLocation bestmatch = null;
		//	int MostWordsMatched = 0;
		//	bool conflict = false;
		//	foreach (StackLocation sl in possibles)
		//	{
		//		if (!Program.Match(words, sl.name))
		//			continue;
		//		if (Program.MatchCount < MostWordsMatched)
		//			continue;
		//		// Accept an unconditional match if 1) it matches the most words, or 2) it matches the same number but is nested deeper (more local)
		//		if (bestmatch != null) conflict = (MostWordsMatched == Program.MatchCount && bestmatch.depth == sl.depth); // avoid null deref
		//		if (!conflict)
		//		{
		//			MostWordsMatched = Program.MatchCount;
		//			bestmatch = sl;
		//		}
		//	}
		//	if (conflict)
		//	{
		//		Console.WriteLine("  multiple interpretations of the {1} words '{0}'", Program.Say(words, 0, MostWordsMatched), MostWordsMatched);
		//		return null;
		//	}
		//	index += MostWordsMatched;
		//	return new instance() { var = bestmatch.inst, toAccess = Indirectedness.local_parameter, type = bestmatch.inst.type };
		//}

		//// Can the local parameters' names be exported to the caller for use after the invocation?  
		////   ... give it to her;
		////   ... examine the thing given;
		//// This would be the difference between passing as ref and by value; using the new name points to the changed value if it
		//// was changed in the callee.  Of course, this only makes sense with assigned vars, not with bound vars.

		//static string FirstWord(this string words)
		//{
		//	if (string.IsNullOrWhiteSpace(words))
		//		return "";
		//	string[] ws = words.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
		//	return ws[0];
		//}

	}


}
