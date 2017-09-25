# complish
a controlled natural language partly inspired by Inform 7

Go read [Defining 'Declarative'](https://awelonblue.wordpress.com/2012/01/12/defining-declarative/) at David Barbour's blog Awelon Blue. He explains what a declarative programming language should be better than I can. 

I also became fond of Inform 7's English-like syntax.  It's hard to learn at first (counter-intuitively) but seeing code you wrote a year ago, you immediately see what your intent was with the code.  Since 90% of coding is reading code rather than writing it, English-like syntax has a role to play in future programming languages. 

English grammar and programming language grammer have some basic similarities. 

* Nouns are objects
* Verbs are functions
* Variables are antecedents (pronouns, plus constructions of the form `the` followed by a common noun)
* Higher-order functions: the function being passed is a gerundial phrase. 
* Plurals are lists/arrays/collections
* All natural languages specify which of a verb's "slots" each noun goes.  Either by placement (i.e., the subject always precedes the verb in English) or by inflection (usually a suffix on each noun to indicate if it's subject or direct object, etc.)  So passing nouns to verbs is no problem.
* Prepositions allow for more parameters than are normal. (English verbs have three slots, Russian has four. The fourth is, in English, usually specified by adding a 'with' prepositional phrase.)
* Indefinite noun phrases are parameters; definite noun phrases are the arguments
* Partially applied function is a gerundial phrase with both definite and indefinite noun phrases
* Relative clauses are very SQL-like or Prolog-like: "the car which/that/where (SELECT criteria)"

There's also some differences.

* English doesn't nest more than a couple levels deep. Functional languages *hate* this!
* Defining a verb is very rare in English while it comprises the majority of coding. 
* Anonymous functions, where you define a new function at the same place you then use it, doesn't seem to fly in English. (And since lambdas are anonymous closures, well...)
* And yet, functional or something like it seems a better fit than imperative, even though imperative remains an option for small tasks
* Tense (past/present) and Aspect (past-perfect & present-perfect) don't seem to have much use. Perhaps this is because there's little to no explicit temporal operatives in most programming languages?  Inform had a rarely used feature where the past-perfect of a player action was essentially a free boolean meaning the action had been performed at least once since game start. Continuous and progressive aspects may be useful in defining things that happen while other things happen, but English doesn't make a clear distinction between continuous and progressive like, say, Mandarin does. 
* Difficult to tell difference between definite & indefinite gerundial phrases with zero parameters, since it's the article on the noun phrases which distinguishes it, and we can't use *gerund* vs *gerund()* to specifically state indefinite or definite.

Anyway, I'd like to marry Barbour's "declarative" with an English-like syntax.  

Other stuff I found.

* I'd like to have explicit temporal operators like *before*, *after*, and *during* since I think they're necessary for 'declarative'
* OO inheritance and polymorphism seems natural in a lot of places
* But multi-methods seem like a better default than OO's usual "object-owned" methods, and reduces the [Kingdom of Nouns](https://steve-yegge.blogspot.com/2006/03/execution-in-kingdom-of-nouns.html) problem


