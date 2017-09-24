using Complish;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;


namespace NUnitTest1
{
	public static class Program
	{
		[STAThread]
		static void Main(string[] args)
		{
			string[] my_args = { Assembly.GetExecutingAssembly().Location };

			int returnCode = NUnit.ConsoleRunner.Runner.Main(my_args);

			if (returnCode != 0)
				Console.Beep();
		}

		// ExtensionMethods /////////////////////////

		public static string PrintPyramid(this ParseForest tree, bool force = false)
		{
			string retval = Environment.NewLine;
			ParseTreeNode[, ,] P = tree.P;
			int n = tree.n, r = tree.r;

			for (int k = n - 1; k >= 0; k--)
			{
				foreach (int i in 1.to(n - k))
				{
					retval += "\t";
					//string retval = "";
					foreach (int nonterminals in 1.to(r))
					{
						NonTerminalSymbol nt = (NonTerminalSymbol)nonterminals;
						if (P[i, k, nonterminals].match && nt != NonTerminalSymbol.comma)
							retval += (retval == "" ? "" : ",") + (nt == NonTerminalSymbol.colon ? ":" : nt.ToString());
					}
					retval += (retval.Length > 10 ? "*" : retval);
				}
				retval += Environment.NewLine;
			}
			foreach (int i in 1.to(n))
				retval += ("\t" + tree.a[i]);
			retval += Environment.NewLine;

			// is valid?
			if (tree.Count == 0)
				retval += Environment.NewLine;
			else if (tree.Count == 1)
				retval += "IS a member of language as a " + tree.SentenceType.ToString();
			else
				retval += "is a member of language but ambiguous, with" + tree.Count + " interpretations";
			return retval;
		}

	}

}
