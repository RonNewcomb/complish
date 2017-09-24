using System;
using System.Collections.Generic;

namespace Complish
{
	public class Scope // a node of a scope tree
	{
		public Dictionary<string, Symbol> symbols1 = new Dictionary<string, Symbol>();
		public Dictionary<string, Symbol> symbols2 = new Dictionary<string, Symbol>();
		public Dictionary<string, List<Symbol>> multimethods = new Dictionary<string, List<Symbol>>();
		public string Name;
		public Scope Enclosing, InheritanceParent;

		public Symbol Define(Symbol s)
		{
			if (symbols1.ContainsKey(s.Name))
				throw new RedeclareException(s.Name);
			symbols1.Add(s.Name, s);
			if (!string.IsNullOrEmpty(s.SecondName))
			{
				if (symbols2.ContainsKey(s.SecondName))
					symbols2[s.SecondName] = null;
				else
					symbols2.Add(s.SecondName, s);
			}
			if (s.Signature != null)
			{
				if (!multimethods.ContainsKey(s.Type))
					multimethods[s.Type] = new List<Symbol>();
				multimethods[s.Type].Add(s);
			}
			return s; // for convenience
		}

		public Symbol ResolveLoneSymbol(string name, Categories wanted = 0)
		{
			if (symbols1.ContainsKey(name)) return symbols1[name];
			if (symbols2.ContainsKey(name)) return symbols2[name];
			return (Enclosing == null) ? null : Enclosing.ResolveLoneSymbol(name, wanted);
		}

		public Symbol ResolvePropertySymbol(string name)
		{
			if (symbols1.ContainsKey(name)) return symbols1[name];
			if (symbols2.ContainsKey(name)) return symbols2[name];
			return (InheritanceParent == null) ? null : InheritanceParent.ResolvePropertySymbol(name);
		}

		public int ResolveMultimethodSymbolByArguments(Invocation invocation)
		{
			long? closestMatch = null;
			int attemptedVerbsInScope = 0; 
			for (var searchScope = this; searchScope != null; searchScope = searchScope.Enclosing)
			{
				var applicableMMs = searchScope.multimethods.OrNull(invocation.verb);
				if (applicableMMs == null) continue;
				foreach (Symbol method in applicableMMs)
				{
					attemptedVerbsInScope++;
					long? thisDistance = method.Signature.Distance(invocation.SuppliedArguments);
					if (thisDistance.HasValue && (closestMatch == null || closestMatch.Value > thisDistance.Value))
					{
						closestMatch = thisDistance;
						invocation.FunctionSymbol = method;
					}
				}
			}
			return attemptedVerbsInScope;
		}

		public override string ToString()
		{
			return (Enclosing != null ? Enclosing + "." : "") + Name;
		}

		public const string GlobalScopeName = "..global";
		public static Scope Current = new Scope() { Name = GlobalScopeName };
		public static List<Scope> All = new List<Scope>() { Current };

		public static StopUsing EnterNew(string ofWhat)
		{
			//"SCOPE+".Log(ofWhat);
			Current = All.And(new Scope() { Name = ofWhat, Enclosing = Current });
			return new StopUsing(Scope.End);
		}
		public static void End()
		{
			//"SCOPE-".Log(Current.Name);
			if (Current.Enclosing != null)
				Current = Current.Enclosing;
			else
				"SCOPE error: tried to end Global Scope".Log();
		}
		public static void Abandon()
		{
			//"SCOPE-".Log(Current.Name);
			All.Remove(Current);
			if (Current.Enclosing != null)
				Current = Current.Enclosing;
			else
				"SCOPE error: tried to abandon Global Scope".Log();
		}

		public static void Initialize()
		{
			foreach (UnitRule r in SyntaxParser.UR)
				if (r.headterm == NonTerminalSymbol.N || r.headterm == NonTerminalSymbol.aNP) // but not r.headterm == NonTerminalSymbol.Adj because there's Noun synonyms for all of them already
					if (r.TypeRule == null)
					{
						var sym = new Symbol
						{
							Name = r.TerminalSymbol,
							Type = t.ParentTypeOf.OrKey(t.AdjToNounTypes.OrKey(r.TerminalSymbol)),
							Category = Categories.ClassObjectStructType,
							PartOfSpeech = (r.headterm == NonTerminalSymbol.aNP ? NonTerminalSymbol.N : r.headterm),
							SecondName = t.AdjToNounTypes.OrEmpty(r.TerminalSymbol),
						};
						try
						{
							Scope.Current.Define(sym);
						}
						catch { ;}
					}
			var theNothing = new Symbol
			{
				Name = "the " + t.Nothing.ToLower(),
				Type = t.Nothing.ToLower(),
				Category = Categories.Variable,
				PartOfSpeech = NonTerminalSymbol.N,
			};
			Scope.Current.Define(theNothing);
			Scope.Current.Define(new Symbol
			{
				Name = "do (nothing)",
				Type = "do",
				Category = Categories.FunctionMultimethod,
				PartOfSpeech = NonTerminalSymbol.V,
				Signature = new Signature("do") { parms = new List<Parameter> { new Parameter("", theNothing)} },
			});
			//var newSymbol = new Symbol()
			//{
			//	Name = "the (identifier)",
			//	Type = "(identifier)",
			//	Category = Categories.Variable,
			//	PartOfSpeech = NonTerminalSymbol.N,
			//};
			//Scope.Current.Define(new Symbol
			//{
			//	Name = "(symbol) begins here",
			//	Type = "begins here",
			//	Category = Categories.FunctionMultimethod,
			//	PartOfSpeech = NonTerminalSymbol.V,
			//	Signature = new Signature("begins here") { parms = new List<Parameter> { new Parameter("", newSymbol) } },
			//});
		}
	}

	public class ScopeException : Exception
	{
		public ScopeException(string message)
			: base("Scope error: " + message)
		{
		}
	}

	public class RedeclareException : ScopeException
	{
		public RedeclareException(string word)
			: base("re-declaring " + word + " in same scope")
		{
		}
	}
}
