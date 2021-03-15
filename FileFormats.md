# File Formats

A documentation of the file formats read and written by this library.

- [File Formats](#file-formats)
	- [Automatas](#automatas)
		- [Course specific](#course-specific)
			- [Examples](#examples)
	- [Context Free Grammars](#context-free-grammars)
		- [JFLAP](#jflap)
		- [Course specific](#course-specific-1)
			- [Examples](#examples-1)

## Automatas

### Course specific

This library can read a format specific to the related course, it works like
this.

* One line with the alphabet, and `ε` if it's a ε-NFA, separated by separated
by whitespace(s).
* And one line per state. Each line should contain the following information in
the following order, separated by whitespace(s).
  * The UTF-8 character `→` or `->` if this is the start state.
  * A `*` if this is a accepting state.
  * The name of the state. One or more non-whitespace characters.
  * Then comes the transitions, in a order corresponding to the symbols of the
    alphabet on the first line.  
    If there are multiple transitions, as can be the case for NFAs and ε-NFAs,
    all transitions for one symbol should be surrounded by `{` `}`, and
    separated by whitespace(s). The UTF-8 character `∅` can be used to
    represent empty sets.

Comments are allowed, everything after a `#` is ignored.

#### Examples

A DFA:
```
       a  b  c
→ * s₀ s₁ s₀ s₂
    s₁ s₂ s₁ s₁
  * s₂ s₂ s₂ s₂
```

A NFA:
```
     a    b    c
→ s₀ {s₀} {s₁} {s₀ s₂}
  s₁  ∅   {s₃}  {s₂}
  s₂  ∅   {s₁}  {s₄}
  s₃ {s₄}  ∅    {s₃}
* s₄  ∅   {s₄}   ∅
```

And a ε-NFA:
```
      ε     a        b
→ s₀  ∅    {s₁}   {s₀ s₂}
  s₁ {s₂}  {s₄}     {s₃}
  s₂  ∅   {s₁ s₄}   {s₃}
  s₃ {s₅} {s₄ s₅}    ∅
  s₄ {s₃}   ∅       {s₅}
* s₅  ∅    {s₅}     {s₅}
```

## Context Free Grammars

### JFLAP

This library can read the XML file format `.jff` of [JFLAP](http://www.jflap.org/).
This has been tested with the JFLAP 4 format.

### Course specific

It can also read a format specific to the related course, it works like this.

Each production of the grammar is written on one line starting with the
non-terminal "name" of the production. Followed by the UTF-8 character `→`.
After that all the alternative of the production is listed, separated by a bar
`|`.

**Note**: Non-terminals must be single uppercase letter (A-Z), all other
characters are considered to be terminals with one exception. The UTF-8
character `ε` is used to represent the empty string.

#### Examples

```
E→EOE|N
O→+|-|ε
N→1|1N
```
