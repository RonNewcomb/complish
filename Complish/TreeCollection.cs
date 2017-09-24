using System;
using System.Collections.Generic;

namespace Complish
{
	public struct ParseTreeNode
	{
		public bool match;
		public ParseTreeNodeMatch list;
		public ParseTreeNode(bool m) { match = m; list = null; }
		public ParseTreeNode(bool m, int k, NonTerminalSymbol B, NonTerminalSymbol C, ParseTreeNodeMatch prev)
		{ match = m; list = new ParseTreeNodeMatch(k, B, C, prev); }
		public override string ToString() { return (match ? "match " : "-") + (list == null ? "-" : "with " + list); }
	}
	public class ParseTreeNodeMatch
	{
		public int k;
		public NonTerminalSymbol B;
		public NonTerminalSymbol C;
		public ParseTreeNodeMatch next = null;
		public ParseTreeNodeMatch(int partition, NonTerminalSymbol b, NonTerminalSymbol c, ParseTreeNodeMatch item)
		{ k = partition; B = b; C = c; next = item; }
		public override string ToString() { return "[" + B + " " + C + "] " + (next == null ? "" : next.ToString()); }
	}

	public class ParseTreeVisitor
	{
		readonly ParseForest Forest;
		public int i, j;
		public ParseTreeNodeMatch currentNode, parentNode;
		public NonTerminalSymbol currentType;

		public ParseTreeVisitor(ParseForest treeCollection, NonTerminalSymbol whichTree)
		{
			if (whichTree == 0)
				throw new Exception("Can't pass 0 to ParseTreeVisitor constructor");
			Forest = treeCollection;
			i = 0;
			j = Forest.n - 1;
			currentNode = Forest.P[i, j, (int)whichTree].list;
			parentNode = null;
			currentType = whichTree;
		}
		public ParseTreeVisitor(ParseForest treeCollection)
			: this(treeCollection, (NonTerminalSymbol)treeCollection.SentenceType)
		{
		}
		public ParseTreeVisitor(ParseTreeVisitor otherVisitor)
		{
			Forest = otherVisitor.Forest;
			i = otherVisitor.i;
			j = otherVisitor.j;
			currentNode = otherVisitor.currentNode;
			parentNode = otherVisitor.parentNode;
			currentType = otherVisitor.currentType;
		}
		public ParseTreeVisitor Left()
		{
			if (currentNode == null) return null;
			parentNode = currentNode;
			j = parentNode.k;
			currentNode = Forest.P[i, j, (int)parentNode.B].list;
			currentType = parentNode.B;
			return this;
		}
		public ParseTreeVisitor Right()
		{
			if (currentNode == null) return null;
			parentNode = currentNode;
			i = i + parentNode.k + 1;
			j = j - parentNode.k - 1;
			currentNode = Forest.P[i, j, (int)parentNode.C].list;
			currentType = parentNode.C;
			return this; 
		}
		public ParseTreeVisitor Alternate()
		{
			if (currentNode == null) return null;
			currentNode = currentNode.next;
			return currentNode != null ? this : null;
		}

		public void All(Action<NonTerminalSymbol, ParseTreeNodeMatch, int, bool /*isLeaf*/> act)
		{
			recurse(i, j, currentType, 0, act);
		}
		protected void recurse(int i, int j, NonTerminalSymbol nt, int d, Action<NonTerminalSymbol, ParseTreeNodeMatch, int, bool> act)
		{
			ParseTreeNode thisnode = Forest.P[i, j, (int)nt];
			ParseTreeNodeMatch m = thisnode.list;
			act(nt, m, i, m == null);
			if (m != null)
			{
				recurse(i, m.k, m.B, d + 1, act);
				recurse(i + m.k + 1, j - m.k - 1, m.C, d + 1, act);
			}
		}
	}

	public class ParseForest
	{
		public int n, r, Count;
		public ParseTreeNode[, ,] P; // P[n,n,r]
		public string[] a; // words that were parsed
		public Rs SentenceType
		{
			get
			{
				if (Count != 1) return (Rs)0;
				foreach (int x in (int[])Enum.GetValues(typeof(Rs)))
					if (P[0, n - 1, x].match)
						return (Rs)x;
				return (Rs)0;
			}
			set
			{
				foreach (int x in (int[])Enum.GetValues(typeof(Rs)))
				{
					if (P[0, n - 1, x].match && (Rs)x != value)
					{
						P[0, n - 1, x].match = false;
						Count--;
					}
				}
			}
		}
		public List<NonTerminalSymbol> SentenceTypes()
		{
			var retval = new List<NonTerminalSymbol>();
			for (NonTerminalSymbol x = 0; x < NonTerminalSymbol.Length; x++)
				if (P[0, n - 1, (int)x].match)
					retval.Add(x);
			return retval;
		}

		public delegate void visitor(ParseForest tree, int depth, bool isLeaf, NonTerminalSymbol A, NonTerminalSymbol B, NonTerminalSymbol C, int x, int y);

		public void ThisLeftRight(visitor act)
		{
			foreach (int nonterminal in 1.to(r))
				Recurse(0, n - 1, (NonTerminalSymbol)nonterminal, 0, act);
		}
		protected void Recurse(int i, int j, NonTerminalSymbol nt, int d, visitor act)
		{
			ParseTreeNode thisnode = P[i, j, (int)nt];
			if (!thisnode.match) return;
			ParseTreeNodeMatch m = thisnode.list;
			if (m != null)
				for (; m != null; m = m.next)
				{
					act(this, d, false, nt, m.B, m.C, i, j);
					Recurse(i, m.k, m.B, d + 1, act);
					Recurse(i + m.k + 1, j - m.k - 1, m.C, d + 1, act);
				}
			else
				act(this, d, true, nt, 0, 0, i, j);
		}
	}


}
