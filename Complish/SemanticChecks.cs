using System;
using System.Collections.Generic;
using System.Linq;

namespace Complish
{
	public class SemanticChecks
	{
		protected class SemanticContext
		{
			public Signature SignatureBeingDefined = new Signature(""); // Symbol being defined, but only the Signature part of it actually changes until the very end
			public Symbol FunctionBeingDefined = null; // carries over between sentences.
			public Invocation InvocationBeingDefined; // are the parts appended to the FunctionBeingDefined; can be several per sentence.
			public string prepFound = ""; // a prep is always followed by NP or aNP
		}

		// Semantic Rules that could be broken
		// 1) "a noun" or an "adjective-noun" combo doesn't mention a type
		// 2) "the noun which" isn't a type. 
		// Not all nouns are types; a property and an instance and a variable are all nouns.

		/// <summary> The return value, a function being defined, needs to be passed back in on the next call. </summary>
		public Symbol CreateTypes(ParseForest forest, Symbol functionBeingDefined)
		{
			return CreateTypes(forest, new SemanticContext {FunctionBeingDefined = functionBeingDefined});
		}
		protected Symbol CreateTypes(ParseForest forest, SemanticContext context)
		{
			try
			{
				// "A wheel is a number" can define either a struct or a subclass.  Here we disambiguate.
				if (forest.SentenceType == 0 && forest.Count == 2 && forest.SentenceTypes().Aggregate("", (a, b) => a + " " + b) == " aSVO DeObj")
					forest.SentenceType = Rs.ObjectDefinition;

				// Imperative functions span multiple sentences. Here, if the new sentence isn't an imperative, end any previous function body. 
				switch (forest.SentenceType)
				{
					case Rs.ImperativeInvocationVO:
					case Rs.ImperativeInvocationSV:
					case Rs.ImperativeInvocationSVO:
					case Rs.ImperativeInvocationV:
					case 0:
						break;
					default:
						EndPreviousFunctionBody(context);
						string.Join(" ", forest.a).Log();
						break;
				}

				// ok, start parsing based on sentence type
				switch (forest.SentenceType)
				{
					case Rs.FunctionDefinition:		
						DefineFuncSymbol(forest, context); 
						break;
					case Rs.ImperativeInvocationVO:
					case Rs.ImperativeInvocationSV:
					case Rs.ImperativeInvocationSVO:
					case Rs.ImperativeInvocationV:
						DefineImpInvSymbol(forest, context);
						break;
					case Rs.ObjectDefinition:
						CreateSymbol(forest, new ParseTreeVisitor(forest), context);
						break;
					case Rs.UnaryRelationDefinition:	
					case Rs.RelationDefinition:
						DefineRelationVerb(forest, context);
						break;
					case Rs.TemporalConstraint:
						DefineTemporalConstraint(forest, context);
						break;
					case Rs.VarInstanceDefinition:
						CreateSymbol(forest, new ParseTreeVisitor(forest), context);
						break;
					case 0:
						if (forest.Count == 0)
						{
							"ERROR. This doesn't parse:".Log(string.Join(" ", forest.a));
							SyntaxParser.PrintPyramid(forest);
						}
						else
							"ERROR. This is ambiguous:".Log(forest.SentenceTypes().Aggregate("", (a, b) => a + " " + b));
						break;
				}
			}
			catch (Exception ex)
			{
				"EXCEPTION:".Log(ex.Message);
			}
			return context.FunctionBeingDefined;
		}

		#region high tier 

		protected void DefineFuncSymbol(ParseForest forest, SemanticContext context)
		{
			new ParseTreeVisitor(forest).Left().All((nt, match, i, isLeaf) =>
			{
				if (!isLeaf) return;
				switch(nt)
				{
					case NonTerminalSymbol.HV:
					case NonTerminalSymbol.V:
					case NonTerminalSymbol.Adv:
						context.SignatureBeingDefined.verb += (context.SignatureBeingDefined.verb == "") ? forest.a[i] : " " + forest.a[i];
						return;
				}
			});
			"MULTIMETHOD ".Log(context.SignatureBeingDefined.verb);

			// parameter list
			Scope.EnterNew(context.SignatureBeingDefined.verb);

			var resetVisitor = new ParseTreeVisitor(forest).Left();
			string errors = WithAlternates(forest, resetVisitor, context, context.SignatureBeingDefined.verb);
			if (errors != null)
				throw new Exception(" Nothing could possibly be passed into the higher-order function " + context.SignatureBeingDefined + Environment.NewLine + errors);

			"SIGNATURE:".Log(context.SignatureBeingDefined);
			context.FunctionBeingDefined = new Symbol
			{
				Name = context.SignatureBeingDefined.ToString(),
				Type = context.SignatureBeingDefined.verb,
				Category = Categories.FunctionMultimethod,
				PartOfSpeech = NonTerminalSymbol.V,
				Signature = context.SignatureBeingDefined,
			};

			// define function in parent scope
			Scope.Current.Enclosing.Define(context.FunctionBeingDefined);
				
			// body of function
			"BODY".Log();
			context.InvocationBeingDefined = new Invocation("");
			CreateSymbol(forest, new ParseTreeVisitor(forest).Right(), context);
			AppendToFunctionBody(context);
			// body may continue if next sentence is imperative.
		}

		protected string WithAlternates(ParseForest forest, ParseTreeVisitor resetVisitor, SemanticContext context, string retryScope = null)
		{
			string errors = "";
			ParseTreeNodeMatch c = resetVisitor.currentNode;
			for (; errors != null && c != null; c = c.next)
				try
				{
					var visitor = new ParseTreeVisitor(resetVisitor) { currentNode = c };
					visitor.Right(); // does this need be here? what if we want Left?  Should i pass in these two lines as delegate? 
					CreateSymbol(forest, visitor, context);
					errors = null;
				}
				catch (Backtrack b)
				{
					"--BACKTRACK".Log();
					errors += b.Message + Environment.NewLine;
					if (retryScope == null) continue;
					Scope.Abandon();
					Scope.EnterNew(retryScope);
				}
			if (errors != null && c == null)
			{
				if (retryScope != null) Scope.Abandon();
				return errors;
			}
			return null;
		}

		protected void DefineRelationVerb(ParseForest forest, SemanticContext context)
		{
			new ParseTreeVisitor(forest).All((nt, match, i, isLeaf) =>
			{
				if (!isLeaf) return;
				switch (nt)
				{
					case NonTerminalSymbol.V:
					case NonTerminalSymbol.HV:
					//case NonTerminalSymbol.G:
					case NonTerminalSymbol.Adv:
						context.SignatureBeingDefined.verb += (context.SignatureBeingDefined.verb == "") ? forest.a[i] : " " + forest.a[i];
						return;
				}
			});
			if (string.IsNullOrWhiteSpace(context.SignatureBeingDefined.verb))
			{
				PrintAST(forest);
				throw new Exception("Can't find the main verb.");
			}
			"MULTIMETHOD_R:".Log(context.SignatureBeingDefined.verb);

			// parameter list
			using (Scope.EnterNew(context.SignatureBeingDefined.verb))
				CreateSymbol(forest, new ParseTreeVisitor(forest), context);
			"SIGNATURE:".Log(context.SignatureBeingDefined);

			Scope.Current.Define(new Symbol
			{
				Name = context.SignatureBeingDefined.ToString(),
				Type = context.SignatureBeingDefined.verb,
				Category = Categories.ClassObjectStructType, // well, struct if no exe body, FuncMultimethod if exe body
				PartOfSpeech = NonTerminalSymbol.V,
				Signature = context.SignatureBeingDefined,
			});
		}

		protected void DefineTemporalConstraint(ParseForest forest, SemanticContext context)
		{
			var DCvisitor = new ParseTreeVisitor(forest);
			var MCvisitor = new ParseTreeVisitor(DCvisitor);
			if (DCvisitor.currentNode.B == NonTerminalSymbol.DC)
			{ DCvisitor.Left(); MCvisitor.Right(); }
			else
			{ DCvisitor.Right(); MCvisitor.Left(); }

			context.SignatureBeingDefined.verb = "??constraint";
			context.InvocationBeingDefined = new Invocation("");

			context.FunctionBeingDefined = new Symbol
			{
				Category = Categories.Constraint, 
				PartOfSpeech = NonTerminalSymbol.TR,
			};
			Scope.EnterNew(context.SignatureBeingDefined.verb);
			DefineImpInvSymbol(forest, context, MCvisitor);
			"  MAIN CLAUSE:".Log(context.SignatureBeingDefined.verb);

			DefineImpInvSymbol(forest, context, DCvisitor);
			"  DEPENDENT CLAUSE:".Log(context.SignatureBeingDefined.verb);

			"DEFINED constraint:".Log(context.SignatureBeingDefined);

			context.FunctionBeingDefined.Name = context.SignatureBeingDefined.ToString();
			context.FunctionBeingDefined.Type = context.SignatureBeingDefined.verb;
			context.FunctionBeingDefined.Signature = context.SignatureBeingDefined;
			Scope.Current.Define(context.FunctionBeingDefined);
			EndPreviousFunctionBody(context);
		}

		protected void DefineImpInvSymbol(ParseForest forest, SemanticContext context, ParseTreeVisitor visitor = null)
		{
			if (visitor == null)
				"  CONTINUE FUNCTION BODY".Log(string.Join(" ", forest.a));

			var visitor2 = (visitor == null) ? new ParseTreeVisitor(forest) : new ParseTreeVisitor(visitor);
			visitor2.All((nt, match, i, isLeaf) =>
			{
				if (!isLeaf) return;
				switch (nt)
				{
					case NonTerminalSymbol.V:
					case NonTerminalSymbol.HV:
					//case NonTerminalSymbol.G:
					case NonTerminalSymbol.Adv:
						context.SignatureBeingDefined.verb += (context.SignatureBeingDefined.verb == "") ? forest.a[i] : " " + forest.a[i];
						return;
				}
			});
			CreateSymbol(forest, visitor ?? new ParseTreeVisitor(forest), context);
			AppendToFunctionBody(context);
		}

		#endregion

		#region mid tier

		protected void CreateSymbol(ParseForest forest, ParseTreeVisitor visitor, SemanticContext context)
		{
			if (visitor == null) return;
			ParseTreeVisitor visitor2;
			switch (visitor.currentType)
			{
				case NonTerminalSymbol.G:
					// the problem with lone gerunds like "giving" is that you don't know if its GP or aGP so look to see what the container is
					if (visitor.parentNode.B == NonTerminalSymbol.IV)
					{   // aGP
						MatchGerundSignature(forest.a[visitor.i], forest, visitor, context, false);
					}
					else if (visitor.parentNode.B == NonTerminalSymbol.VO || visitor.parentNode.B == NonTerminalSymbol.SVO)
					{   // GP
						//if (visitor.currentNode != null && visitor.currentNode.B == NonTerminalSymbol.G)
							MatchGerundSignature(forest.a[visitor.i], forest, visitor, context, false);
						//else
						//	FillParameterWith_NP(forest, visitor, context); // the G -- G is an argument
					}
					else
						throw new Exception("Unknown context for lone gerund.");
					break;
				case NonTerminalSymbol.NPPP:
				case NonTerminalSymbol.SV:
				case NonTerminalSymbol.SVO:
				case NonTerminalSymbol.VO:
				case NonTerminalSymbol.IsHas:
				case NonTerminalSymbol.NPs:
				case NonTerminalSymbol.ConjNP:
				case NonTerminalSymbol.aSVO:
				case NonTerminalSymbol.aNPPP:
					visitor2 = new ParseTreeVisitor(visitor);
					CreateSymbol(forest, visitor.Left(), context);
					CreateSymbol(forest, visitor2.Right(), context);
					break;
				case NonTerminalSymbol.XYZ:
					CreateSymbol(forest, visitor.Right(), context);
					break;
				case NonTerminalSymbol.Conj:
				case NonTerminalSymbol.comma:
				case NonTerminalSymbol.colon:
					break;
				case NonTerminalSymbol.aSV:
					if (visitor.currentNode != null && visitor.currentNode.B == NonTerminalSymbol.G)
						MatchGerundSignature(forest.a[visitor.i], forest, visitor.Left(), context, true);
					else
						CreateParameterFrom_aNP(forest, visitor.Left(), context, true);
					break;
				case NonTerminalSymbol.aVO:
					if (visitor.currentNode != null && visitor.currentNode.B == NonTerminalSymbol.G)
						MatchGerundSignature(forest.a[visitor.i], forest, visitor.Right(), context, false);
					else
						CreateParameterFrom_aNP(forest, visitor.Right(), context, true);
					break;
				case NonTerminalSymbol.aGP:
				case NonTerminalSymbol.aNP:
					if (visitor.currentNode != null && visitor.currentNode.B == NonTerminalSymbol.G)
						MatchGerundSignature(forest.a[visitor.i], forest, visitor, context, false);
					else
						CreateParameterFrom_aNP(forest, visitor, context);
					break;
				case NonTerminalSymbol.aPP:
				case NonTerminalSymbol.PP:
					context.prepFound = "";
					visitor2 = new ParseTreeVisitor(visitor);
					CreateSymbol(forest, visitor.Left(), context);
					CreateSymbol(forest, visitor2.Right(), context);
					break;
				case NonTerminalSymbol.P:
					context.prepFound = forest.a[visitor.i];
					break;
				case NonTerminalSymbol.GP:
					MatchGerundSignature(forest.a[visitor.i], forest, visitor, context, false);
					break;
				case NonTerminalSymbol.NP:
					// is this NP actually a gerund phrase?
					if (visitor.currentNode != null && visitor.currentNode.B == NonTerminalSymbol.G)
						MatchGerundSignature(forest.a[visitor.i], forest, visitor, context, false);
					else
						FillParameterWith_NP(forest, visitor, context);
					break;
				case NonTerminalSymbol.V:
				case NonTerminalSymbol.VP:
					if (context.InvocationBeingDefined == null)
						context.InvocationBeingDefined = new Invocation(forest.a[visitor.i]);
					else
						context.InvocationBeingDefined.verb = forest.a[visitor.i];
					break;
				case NonTerminalSymbol.Ops:
					//AppendToFunctionBody(context);
					visitor2 = new ParseTreeVisitor(visitor);
					CreateSymbol(forest, visitor.Left(), context);
					CreateSymbol(forest, visitor2.Right(), context);
					break;
				case NonTerminalSymbol.ConjOp:
					AppendToFunctionBody(context);
					visitor2 = new ParseTreeVisitor(visitor);
					CreateSymbol(forest, visitor.Left(), context);
					CreateSymbol(forest, visitor2.Right(), context);
					break;
				case NonTerminalSymbol.body:
					CreateSymbol(forest, visitor.Right(), context);
					AppendToFunctionBody(context);
					break;
				case NonTerminalSymbol.DeObj:
				case NonTerminalSymbol.DeVar:
					var whichCase = visitor.currentType;
					visitor2 = new ParseTreeVisitor(visitor);
					if (visitor.currentNode.B == NonTerminalSymbol.G)
						throw new Exception("Can't use a gerund phrase yet");
					Symbol ident = CreateSymbolFromNP(forest, visitor.Left(), context);
					using (Scope.EnterNew("of " + ident.Name))
					{
						CreateSymbol(forest, visitor2.Right(), context);
						if (whichCase == NonTerminalSymbol.DeVar && context.SignatureBeingDefined.parms.Count == 1)
							ident.Type = context.SignatureBeingDefined.parms[0].aNP.Type;
					}
					break;
				default:
					visitor.currentType.ToString().Log("isn't known by the big switch statement in CreateSymbol");
					return;
			}
		}

		#endregion

		#region leaf tier

		/// <summary> Used by "A car is.." and "The corvette is..." but can possibly be used to create a symbol from any aNP or NP. </summary>
		protected Symbol CreateSymbolFromNP(ParseForest forest, ParseTreeVisitor visitor, SemanticContext context)
		{
			string adj = "", noun = "", det = "a"; 
			visitor.All((nt, match, i, isLeaf) =>
			{
				if (!isLeaf) return;
				switch (nt)
				{
					case NonTerminalSymbol.The: det = forest.a[i]; break;
					case NonTerminalSymbol.a: det = forest.a[i]; break;
					case NonTerminalSymbol.Adj: adj += (adj == "") ? forest.a[i] : " " + forest.a[i]; break;
					case NonTerminalSymbol.N: noun += (noun == "") ? forest.a[i] : " " + forest.a[i]; break;
					default: throw new Exception("CreateSymbolFromSubject() visitor found a " + nt + " instead of a N or Adj.");
				}
			});

			if (adj == "" && noun == "") 
				throw new Exception("both adj & noun are blank???  CreateSymbolFromSubject()");

			if (adj != "" && noun != "")
			{
				Symbol nountype = Scope.Current.ResolveLoneSymbol(noun);
				if (nountype != null) throw new RedeclareException(noun);
				Symbol adjtype = (adj != "") ? Scope.Current.ResolveLoneSymbol(t.AdjToNounTypes.OrKey(adj)) : null;
				if (adjtype != null) throw new RedeclareException(adj);
				throw new RedefineException(noun, adj);
			}

			string fullname = (det != "a") ? "the " + (adj + " ").TrimStart() + noun : (noun != "") ? noun : adj;
			var newSymbol = new Symbol
			{
				Name = fullname,
				Type = t.Something,
				Category = (det != "a") ? /* Global */Categories.Variable : Categories.ClassObjectStructType, 
				PartOfSpeech = (fullname == adj) ? NonTerminalSymbol.Adj : NonTerminalSymbol.N,
			};
			"  DEFINED:".Log(newSymbol.Name);
			return Scope.Current.Define(newSymbol); 
		}

		/// <summary> Used for parameters of a function, struct, etc. For subject, used by struct.</summary>
		protected Symbol CreateParameterFrom_aNP(ParseForest forest, ParseTreeVisitor visitor, SemanticContext context, bool isSubject = false)
		{
			if (visitor.currentType != NonTerminalSymbol.a && visitor.currentType != NonTerminalSymbol.Adj && visitor.currentType != NonTerminalSymbol.N
			 && visitor.currentType != NonTerminalSymbol.AdN && visitor.currentType != NonTerminalSymbol.aGP && visitor.currentType != NonTerminalSymbol.G && visitor.currentType != NonTerminalSymbol.aNP)
				throw new Exception(visitor.currentType + " was passed to CreateParameterFrom_aNP; was expecting Adj, N, AdN, a, G, aGP");
			string adj = "", noun = "", det = "a";

			visitor.All((nt, match, i, isLeaf) =>
			{
				if (!isLeaf) return;
				switch (nt)
				{
					case NonTerminalSymbol.a: det = forest.a[i]; break;
					case NonTerminalSymbol.Adj: adj += (adj == "") ? forest.a[i] : " " + forest.a[i]; break;
					case NonTerminalSymbol.N: noun += (noun == "") ? forest.a[i] : " " + forest.a[i]; break;
					case NonTerminalSymbol.aNP: noun += (noun == "") ? forest.a[i] : " " + forest.a[i]; break; // "nothing"
					default: 
						Scope.Abandon();
						throw new Exception("Visitor found a " + nt + " instead of a N, Adj, a/many, or aNP."); 
				}
			});

			if (adj == "" && noun == "")
			{
				Scope.Abandon();
				throw new Exception("both adj & noun are blank??? CreateParameterFrom_aNP()");
			}

			Symbol nountype = Scope.Current.ResolveLoneSymbol(noun, Categories.ClassObjectStructType);
			Symbol adjtype = (nountype == null && adj != "") ? Scope.Current.ResolveLoneSymbol(t.AdjToNounTypes.OrKey(adj), Categories.ClassObjectStructType) : null;

			if (nountype == null && adjtype == null)
			{
				Scope.Abandon();
				throw new Exception("neither '" + noun + "' nor '" + adj + "' are types in current scope. CreateParameterFrom_aNP()");
			}

			bool dontFullyQualify = (adjtype == null && adj != "") || (adjtype != null && nountype == null) || (isSubject);
			string sym = (adjtype == null) ? (adj + " ").TrimStart() + noun : (nountype != null ? t.AdjToNounTypes.OrKey(adj) : noun);

			string fullName = dontFullyQualify ? sym : (sym + " " + (context.SignatureBeingDefined.verb == "" ? "" : "being " + context.SignatureBeingDefined.verb.FormOf(Inflections.past_participal)) + " " + context.prepFound).TrimEnd();

			det = (det == "several" || det == "many") ? "each " : "the ";

			string verb_s = context.SignatureBeingDefined.verb.FormOf(Inflections.plural);
			string verber = !isSubject ? "" : verb_s.EndsWith("e") ? det + verb_s + "r" : det + verb_s + "er";

			var newSymbol = new Symbol
			{
				Name = det + fullName,
				Type = (adjtype == null) ? nountype.Name : t.AdjToNounTypes.OrKey(adjtype.Name),
				Category = Categories.Variable, // local variable
				PartOfSpeech = NonTerminalSymbol.N,
				SecondName = fullName.Contains(" being ") ? det + fullName.Substring(0, fullName.IndexOf(" being ")) : verber,
			};
			context.SignatureBeingDefined[context.prepFound] = newSymbol;
			context.SignatureBeingDefined.HasSubject |= isSubject;
			"  PARAM:".Log(newSymbol.Name + "  (" + (det == "the " ? "a " : det) + newSymbol.Type + ") " + (newSymbol.SecondName == "" ? "" : "\"" + newSymbol.SecondName + "\""));
			return Scope.Current.Define(newSymbol);
		}

		protected Symbol MatchGerundSignature(string gerund, ParseForest forest, ParseTreeVisitor visitor, SemanticContext context, bool isSubject)
		{
			string root = gerund.FormOf(Inflections.plural);
			"  Found gerund for".Log(root);
			var context2 = new SemanticContext { InvocationBeingDefined = new Invocation(root), SignatureBeingDefined = new Signature(root), };
			CreateSymbol(forest, visitor.Right(), context2);
			context2.InvocationBeingDefined.SuppliedArguments = context2.SignatureBeingDefined.parms;
			Scope.Current.ResolveMultimethodSymbolByArguments(context2.InvocationBeingDefined);
			if (context2.InvocationBeingDefined.FunctionSymbol == null)
				throw new Backtrack("Signature of parameter-function \"" + context2.SignatureBeingDefined + "\" doesn't match any existing functions.");
			
			var newSymbol = new Symbol
			{
				Name = context2.SignatureBeingDefined.verb,  // todo: might the name & type be backward? It's usually the other way but the logging looks better this way: it's more precise
				Type = context2.SignatureBeingDefined.ToString(),
				Category = Categories.Variable,  // local variable
				PartOfSpeech = NonTerminalSymbol.GP,
			};
			context.SignatureBeingDefined[context.prepFound] = newSymbol;
			context.SignatureBeingDefined.HasSubject |= isSubject;
			"  Higher-order function".Log("\"" + context.SignatureBeingDefined + "\" has a parameter \"" + context2.SignatureBeingDefined + "\" which could accept any \"" + context2.InvocationBeingDefined.FunctionSymbol.Signature + "\"");
			return context2.InvocationBeingDefined.FunctionSymbol;
		}

		/// <summary> Used by invocations. </summary>
		protected Symbol FillParameterWith_NP(ParseForest forest, ParseTreeVisitor visitor, SemanticContext context)
		{
			if (visitor.currentType != NonTerminalSymbol.The && visitor.currentType != NonTerminalSymbol.Adj && visitor.currentType != NonTerminalSymbol.N
			 && visitor.currentType != NonTerminalSymbol.AdN && visitor.currentType != NonTerminalSymbol.G && visitor.currentType != NonTerminalSymbol.NP)
				throw new Exception(visitor.currentType + " was passed to FillParameterWith_NP; was expecting Adj, N, AdN, a, G");
			string sym = "", det = "the";

			visitor.All((nt, match, i, isLeaf) =>
			{
				if (!isLeaf) return;
				switch (nt)
				{
					case NonTerminalSymbol.The: 
						det = forest.a[i]; 
						break;
					case NonTerminalSymbol.N: 
					case NonTerminalSymbol.NP:
					case NonTerminalSymbol.Adj: 
						sym += (sym == "") ? forest.a[i] : " " + forest.a[i]; 
						break;
					case NonTerminalSymbol.Rp:
						PrintAST(forest);
						throw new Exception("Visitor found a " + nt + " instead of a N, Adj, the/each, or NP.");
					default: 
						throw new Exception("Visitor found a " + nt + " instead of a N, Adj, the/each, or NP.");
				}
			});
			if (sym == "") throw new Exception("sym is blank??? FillParameterWith_NP()");

			det = (det == "several" || det == "many" || det == "each" || det == "every") ? "each " : "the ";
			Symbol symbol = Scope.Current.ResolveLoneSymbol(det + sym) ?? t.AsNumber(sym);
			if (symbol == null) throw new UndefinedException(det + sym);
			context.InvocationBeingDefined.SuppliedArguments.Add(new Parameter(context.prepFound, symbol));
			return symbol;
		}

		protected void AppendRCToFunctionBody(SemanticContext context)
		{
			//if (context.invokedVerb == "") return;
			//Invocation invocation = Scope.Current.ResolveMultimethodSymbolBycontext.arguments(context.invokedVerb, context.arguments);
			//functionBody.Add(invocation);
			//context.invokedVerb = "";
			//context.arguments = new List<Parameter>();
		}

		protected void AppendToFunctionBody(SemanticContext context)
		{
			if (context.FunctionBeingDefined == null)
				throw new Exception("Called AppendToFunctionBody without a function definition");
			if (context.InvocationBeingDefined.verb == "") return;
			int attemptedVerbsInScope = Scope.Current.ResolveMultimethodSymbolByArguments(context.InvocationBeingDefined);
			if (context.InvocationBeingDefined.FunctionSymbol == null)
				throw new Exception("Cannot resolve verb '" + context.InvocationBeingDefined.verb + "' to anything in scope. " +
									(attemptedVerbsInScope > 0 ? attemptedVerbsInScope + " definitions for " + context.InvocationBeingDefined.verb + " were found, but didn't fit the parameters." : ""));
			" ".Log(context.InvocationBeingDefined.FunctionSymbol.Name);

			if (context.FunctionBeingDefined.FunctionBody == null)
				context.FunctionBeingDefined.FunctionBody = new List<Invocation>();
			context.FunctionBeingDefined.FunctionBody.Add(context.InvocationBeingDefined);
			context.InvocationBeingDefined = new Invocation("");
		}

		protected void EndPreviousFunctionBody(SemanticContext context)
		{
			if (context.FunctionBeingDefined != null)
			{
				Scope.End();
				"END".Log(context.FunctionBeingDefined.Name);
				context.FunctionBeingDefined = null;
			}
			"".Log();
		}

		#endregion

		#region debug printing

		public void PrintAST(ParseForest forest)
		{
			forest.ThisLeftRight((tree, depth, isleaf, A, B, C, x, y) =>
			{
				string indent = "";
				for (int id = 0; id < depth; id++) indent += "  ";
				if (isleaf)
					(indent + A + ":" + tree.a[x]).Log();
				else
					string.Format(indent + "{0}:{1},{2} at ({3},{4})", A, B, C, x,y).Log();
			});
		}

		#endregion
	}

}
