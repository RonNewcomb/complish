using System;
using System.Collections.Generic;

namespace Complish
{
	public class Symbol
	{
		public string Name;
		public string Type; // type of this symbol, not a type that it is defining
		public Categories Category;
		public NonTerminalSymbol PartOfSpeech = NonTerminalSymbol.N;
		public string SecondName; // optional; mainly for nouns (parameters)
		public Signature Signature; // only for functions, of course
		public List<Invocation> FunctionBody; // only for functions, of course
		public override string ToString()
		{
			switch (Category)
			{
				case Categories.ClassObjectStructType:
					return "Symbol: Noun: " + Name + " (a " + Type + ")";
				case Categories.Constraint:
					return "Symbol: Constraint: " + Name;
				case Categories.FunctionMultimethod:
					return "Symbol: " + Signature;
				case Categories.Variable:
					return "Symbol: Var: " + Name + " (a " + Type + ")";
				default:
					return "Symbol: " + Category;
			}
		}
	}

	public class Parameter
	{
		public string preposition;
		public Symbol aNP;
		public Parameter(string prep, Symbol noun)
		{
			preposition = prep;
			aNP = noun;
		}
	}

	public class Invocation
	{
		public string verb = "";
		public Symbol FunctionSymbol;
		public List<Parameter> SuppliedArguments = new List<Parameter>();
		public Invocation(string invokedVerb) { verb = invokedVerb; }
	}

	public class Signature
	{
		public bool HasSubject = false;
		public string verb = "";
		public List<Parameter> parms = new List<Parameter>();
		public Symbol this[string preposition]
		{
			get
			{
				foreach (var parm in parms)
					if (preposition == parm.preposition)
						return parm.aNP;
				return null;
			}
			set
			{
				parms.Add(new Parameter(preposition, value));
			}
		}

		public Signature(string verb)
		{
			this.verb = verb;
		}

		public override string ToString()
		{
			string signame = HasSubject ? "" : verb + " ";
			for (int i = 0; i < parms.Count; i++)
			{
				if (i == 0 && HasSubject && verb == "")
					signame += "S:";
				else if (i == 1 && HasSubject && verb != "")
					signame += verb + " ";
				signame += "(" + (parms[i].preposition + " ").TrimStart() + parms[i].aNP.Type + ") ";
			}
			return signame;
		}

		/// <summary>Given a method signature and the types of the values being fed to it, this calculates how close of a match the values are for
		/// that signature.  It's used during multi-method dispatch when multiple methods can take that set of inputs to choose the 
		/// best match for those inputs.</summary>
		public long? Distance(List<Parameter> suppliedArguments)
		{
			// hopefully the signature's verb and the used verb match. If not, why call this function?
			if (suppliedArguments.Count != parms.Count) return null;
			long summation = 0;
			int i = 0;
			foreach (Parameter parm in parms)
			{
				if (parm.preposition != suppliedArguments[i].preposition) continue; // check preposition
				if (parm.aNP.PartOfSpeech != NonTerminalSymbol.N) continue;
				var squareme = t.Distance(suppliedArguments[i].aNP.Type, parm.aNP.Type);
				if (squareme < 0) return null; // the type of the supplied argument doesn't match the parameter's type  
				summation += squareme * squareme;
				i++;
			}
			return summation;
		}

	}

	public static class Extensions
	{
		public static Symbol FindBestMatchingSig(this List<Parameter> arguments, List<Symbol> applicableMMs, long? closestDistance = null, Symbol closestSymbol = null)
		{
			//int attemptedVerbsInScope = 0;
			if (applicableMMs == null) return null;
			foreach (Symbol method in applicableMMs)
			{
				//attemptedVerbsInScope++;
				long? thisDistance = method.Signature.Distance(arguments);
				if (thisDistance.HasValue && (closestDistance == null || closestDistance.Value > thisDistance.Value))
				{
					closestDistance = thisDistance;
					closestSymbol = method;
				}
			}
			return closestSymbol;
		}
	}

	public enum Categories
	{
		ClassObjectStructType = Rs.ObjectDefinition, // can be used to Type others; is also a mini-namespace scope
		FunctionMultimethod = Rs.FunctionDefinition, // creates a new scope
		Variable = Rs.VarInstanceDefinition,
		Constraint = Rs.TemporalConstraint,
		//Statement = Rs.ImperativeInvocation,
	}

	public class RedefineException : Exception
	{
		public RedefineException(string word1, string word2)
			: base("Re-defining '" + word1 + "' and/or '" + word2 + "'?")
		{
		}
	}

	public class UndefinedException : Exception
	{
		public UndefinedException(string ident)
			: base("Does not resolve: " + ident)
		{
		}
	}

}
