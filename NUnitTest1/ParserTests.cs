using Complish;
using NUnit.Framework;
using System;
using System.IO;
using System.Collections.Generic;

namespace NUnitTest1
{
	[TestFixture]
	public class ParserTests
	{
		[Test]
		public void Parser()
		{
			string input = "To draw giving, do nothing";
			var compiler = new Complish.Complish();
			var sentence = compiler.DataSegment.LiftLiteralStrings(input);
			var parsedSentence = compiler.SyntaxParse.Sentence(sentence);

			Assert.AreEqual(parsedSentence.SentenceType, Rs.FunctionDefinition);
			File.WriteAllText(@".\me.txt", parsedSentence.PrintPyramid());
			Assert.AreEqual(parsedSentence.PrintPyramid(), @"
	,DeFun
	,DeFun
	,DeFun*	,Ops*
	*	,Ops*	*
	,tVO*	*	*	,ConjOp,body*
	,IV*	,VO,aVO*	*	,ConjOp,body*	,VO,aVO*
	,P,To*	,V*	,G*	,Conj,:*	,V*	,NP,aNP*
	to	draw	giving	,	do	nothing
IS a member of language as a FunctionDefinition");
		}



	}
}
