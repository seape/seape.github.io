import{_ as o}from"./plugin-vue_export-helper-c27b6911.js";import{r as c,o as u,c as m,b as e,e as r,w as n,f as l,d as s}from"./app-49149863.js";const v={},b=l(`<h2 id="data" tabindex="-1"><a class="header-anchor" href="#data" aria-hidden="true">#</a> Data</h2><h3 id="basic-data-types" tabindex="-1"><a class="header-anchor" href="#basic-data-types" aria-hidden="true">#</a> Basic Data Types</h3><ul><li><strong>character</strong>: &quot;a&quot;, &quot;test&quot;</li><li><strong>numeric</strong>: 2, 47.5</li><li><strong>integer</strong>: 2L (L is a special instruction to treat number as an interger)</li><li><strong>logical</strong>: TRUE, FALSE</li><li><strong>complex</strong>: 1 + 2i</li></ul><details class="hint-container details"><summary>Sample</summary><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>a &lt;- &quot;abc&quot;; 
class(a)  #character
typeof(a)  #character

b &lt;- 2
class(b)  #numeric
typeof(b)  #double

d &lt;- 2L
class(d) #integer
typeof(d) #integer

# Integer is numeric too.
# Integers are 32-bit numbers while numerics are 64-bit doubles
x &lt;- 2L
is.integer(x)   #TRUE
is.numeric(x)   #TRUE
y &lt;- 2
is.integer(y)   #FALSE
is.numeric(y)   #TRUE

x &lt;- 1:1000
is.integer(x)   #TRUE
object.size(x)  #4048 bytes

y &lt;- as.numeric(1:1000)
object.size(y)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></details><h3 id="data-structure" tabindex="-1"><a class="header-anchor" href="#data-structure" aria-hidden="true">#</a> Data Structure</h3><ol><li><strong><span style="color:#e39602;">Vector</span></strong>: Vector is a collection of elements of the same type, that is a character or logical or integer or numeric but never a mix of different types.</li><li><strong><span style="color:#e39602;">List</span></strong>: A list is a special type of vector, it is a collection of objects which don’t need to be of the same type. Unlike a vector, every object in the list could be absolutely anything. A list can be a combination of vectors, matrices, arrays, other lists, etc. A list is a universal container for any type of data.</li><li><strong><span style="color:#e39602;">Matrix</span></strong>: A matrix is a two-dimensional structure very similar to a vector. There is a number of rows and columns and all elements should be of the same type - numeric or character or logical, etc.</li><li><strong><span style="color:#e39602;">Data frame</span></strong>: A data frame is the most important data structure for statistics and data analysis. A data frame is a <em><strong>defacto standard</strong></em> for tabular data used in statistics.</li><li><strong><span style="color:#e39602;">Factors</span></strong>: The last data structure to mention is a factor. It is used to efficiently store and process <strong>categorical data.</strong></li></ol>`,6),h={class:"hint-container details"},p=e("summary",null,"Sample code",-1),g=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`help("Memory-limits")
a <- "abcde"
length(a)    #check the length of vector

x <- vector() # an empty logical vector (default one)
length(x)

# create vectors
y <- vector("character", length=5)# a charactor vector with 5 empty elements
y
numeric(5) # a numeric vector with 5 elements
logical(5) # a logical vector with 5 elements
character(5) # a character vector with 5 elements
integer(5) # an integer vector with 5 elements

# create a vector by specifying its content using function c() 
x <- c(1,2,3,4,5)
class(x)
length(x)

# vector is a homogeneous collection of elements, 
# if you try to combine different data types they will be automatically converted.
x <- c(1,2,3,4,"a")
x   ## [1] "1" "2" "3" "4" "a"
class(x)

x <- c(1L,2L,3L,4L,5L)
x
class(x)

y <- c(x, 2.2)  # combining two numeric vectors of one element each
y
class(y)

x <- c(1,2,3,4,"5")
x
y <- as.numeric(x)
y

#All elements will be converted into whatever is “easy” to convert without losing information.
x <- c(1,2,3,4,"abc")
x
y <- as.numeric(x)
y

# You can be more flexible with seq() and get any kind of numerical sequences
seq(from = 5, to = 10, by = 0.2)
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),f=e("p",null,"Vectors always have the same type of data with the only exception - they can have missing data represented as NA (Not Available), which is a special value indicating missing data.",-1),y=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`x <- c(1,2,3,NA,5)
class(x) # numeric

y <- c("a", "b", "c", NA, "e")
class(y) #character

z <- c(TRUE, TRUE, FALSE, NA)
class(z) #logical


#The function is.na() check every element of the vector to be NA.
x <- c(1,2,3,NA,5)
is.na(x)  # FALSE FALSE FALSE TRUE FALSE
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),x=e("p",null,"Every object can have attributes. Attributes are object-specific and they are part of the object. Attributes include:",-1),w=e("ol",null,[e("li",null,[e("strong",null,"length()"),s(" - length of the object, that is, the number of elements")]),e("li",null,[e("strong",null,"names()"),s(" - names of each element if any")]),e("li",null,[e("strong",null,"dim()"),s(" - number of dimensions of the object")]),e("li",null,[e("strong",null,"class()"),s(" - data type")]),e("li",null,[e("strong",null,"nchar()"),s(" - number of characters in every element of the object")]),e("li",null,[e("strong",null,"attributes()"),s(" - provides a list of available attributes")])],-1),R=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`x <- c("a" = 1, "b" = 2, "c" = 3)
x 
## a b c
## 1 2 3  
class(x)     ## [1] "numeric"
length(x)    ## [1] 3
names(x)     ## [1] "a" "b" "c"
attributes(x)## $names
             ## [1] "a" "b" "c"

y <- c("abc", "defgh")
nchar(y)     ## [1] 3 5

# Every function can be used not just to read object attributes but to change them too
names(x) <- c("d", "e", "f")
x
## d e f
## 1 2 3

# To access any element of the vector you can use an index or a name (for a named vectors) of the element
x <- c("a" = 11, "b" = 12, "c" = 13)
x[2] # get a value by an index
## b
## 12

x["b"] # get a value by a name
## b
## 12

# You can assign new values to the elements of the vector using indexes or names. 
x <- c("a" = 11, "b" = 12, "c" = 13)
x
## a b c
## 11 12 13
x["b"] <- 99 # assign value 99 to an element with name "b" of the vector "x"
x
## a b c
## 11 99 13
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),k=e("p",null,null,-1),_=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`x <- list(1:5, 2.5, "abcdef", TRUE)
x
## [[1]]
## [1] 1 2 3 4 5
##
## [[2]]
## [1] 2.5
##
## [[3]]
## [1] "abcdef"
##
## [[4]]
## [1] TRUE

# Similar to a vector, a list can be named. 
# That is, every element of the list can have a name that can be used
# to retrieve data.
x <- list(a = 1:5, b = 2.5, c = "abcdef", d = TRUE)
x
## $a
## [1] 1 2 3 4 5
##
## $b
## [1] 2.5
##
## $c
## [1] "abcdef"
##
## $d
## [1] TRUE

# To address elements of the list you can use indexes in double square brackets 
# or elements names if the list is named. Also, you can use a so-called 
# dollar-sign notation (for named list only).
x[[3]] # list element number 3
x[["c"]] # list element with name "c"
x$c # the same as above - element with name "c"

# As mentioned before, a list is a special type of a vector. 
# Hence, you can use an index (or a name) with a single square brackets 
# but the result will be a list a single element. 
# So, a list is a collection of one-element lists containing object of 
# any data types.:
x <- list(a = 1:5, b = 2.5, c = "abcdef", d = TRUE)
x
## $a
## [1] 1 2 3 4 5
##
## $b
## [1] 2.5
##
## $c
## [1] "abcdef"
##
## $d
## [1] TRUE
x[1]
## $a
## [1] 1 2 3 4 5
class(x[1])   ## [1] "list"
length(x[1])  ## [1] 1

x[[1]]        ## [1] 1 2 3 4 5
class(x[[1]]) ## [1] "integer"

length(x[[1]])## [1] 5
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),A=e("p",null,null,-1),T=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`m <- matrix(nrow = 2, ncol = 3) # empty matrix with 2 columns and 3 rows
m
## [,1] [,2] [,3]
## [1,] NA NA NA
## [2,] NA NA NA

class(m)
## [1] "matrix" "array"

typeof(m) # by default empty matrix is logical the same way as empty vector
## [1] "logical"

dim(m)
## [1] 2 3

# There are two dimensions and the first one (rows) has two elements, 
# while the second one (columns) has three elements. In R rows are 
# always a first dimension.

m <- matrix(c(1:6), 2, 3)
m

## [,1] [,2] [,3]
## [1,] 1 3 5
## [2,] 2 4 6

class(m)   ## [1] "matrix" "array"
typeof(m)  ## [1] "integer"

# By default, matrices in R are filled column-wise. 
# However, you can change that behavior with the optional
# parameter byrow if you need it.
m <- matrix(letters, ncol = 2, byrow = TRUE) # filling row-wise
m
## [,1] [,2]
## [1,] "a" "b"
## [2,] "c" "d"
## [3,] "e" "f"
## [4,] "g" "h"
## [5,] "i" "j"
## [6,] "k" "l"
## [7,] "m" "n"
## [8,] "o" "p"
## [9,] "q" "r"
## [10,] "s" "t"
## [11,] "u" "v"
## [12,] "w" "x"
## [13,] "y" "z"

class(m)  ## [1] "matrix" "array"
typeof(m) ## [1] "character"


# There are other ways to create a matrix. 
# 1. The first one is to start with a vector and then transform it into a matrix by changing its dimension attribute.
x <- 1:12
dim(x)  ## NULL
dim(x) <- c(3, 4)
x
## [,1] [,2] [,3] [,4]
## [1,] 1 4 7 10
## [2,] 2 5 8 11
## [3,] 3 6 9 12
# 2. The second option is to combine two (or more) vectors by binding them together with functions 
#    a. rbind()  (row bind) and 
#    b. cbind()  (column bind). 
#  These functions work not just for matrices but for any objects that can create a two-dimensional structure.
x <- 1:4
y <- 5:8
cbind(x,y) # take vectors "x" and "y" as columns
## x y
## [1,] 1 5
## [2,] 2 6
## [3,] 3 7
## [4,] 4 8

rbind(x,y) # take the same vectors as rows
## [,1] [,2] [,3] [,4]
## x 1 2 3 4
## y 5 6 7 8

# Indexing of values in a matrix requires two indexes - 
#  1. first for a row and 
#  2. second for a column.
m <- matrix(1:12, 3, 4)
m
## [,1] [,2] [,3] [,4]
## [1,] 1 4 7 10
## [2,] 2 5 8 11
## [3,] 3 6 9 12

m[2,4] # value on the row 2 and on the column 4
## [1] 11
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),q=e("p",null,[e("strong",null,"Array"),s(": Array is a matrix with more than two dimensions. There might be as many dimensions as you want but all elements should be of the same data type.")],-1),E=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`x <- 1:12
dim(x) <- c(2, 3, 2) # make a 3-dimensional array
x
## , , 1
##
## [,1] [,2] [,3]
## [1,] 1 3 5
## [2,] 2 4 6
##
## , , 2
##
## [,1] [,2] [,3]
## [1,] 7 9 11
## [2,] 8 10 12

class(x)    ## [1] "array"
typeof(x)   ## [1] "integer"
x[2,3,2] # an element in row 2, column 3 of the slice 2
## [1] 12
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),S=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`df <- data.frame(id = letters[1:10], x = 1:10, y = 11:20)
df
##   id x y
## 1 a 1 11
## 2 b 2 12
## 3 c 3 13
## 4 d 4 14
## 5 e 5 15
## 6 f 6 16
## 7 g 7 17
## 8 h 8 18
## 9 i 9 19
## 10 j 10 20

# A data frame always has column names. If you try to create a data frame 
# without providing column names, which is possible, column names will be 
# created for you automatically. Rows can have names too but this is optional.

names(df)   ## [1] "id" "x" "y"
class(df)   ## [1] "data.frame"
typeof(df)  ## [1] "list"
dim(df)     ## [1] 10 3

# A data frame is a special type of list, which is a special type of a vector.
# Also, a data frame has the two-dimensional structure as a matrix, which is 
# a special type of a vector too. 
# Hence, all types of indexing or accessing values you have seen before can be 
# used with data frame.

df["x"] # single brackets with a name. Result is a data frame with one column.
##   x
## 1 1
## 2 2
## 3 3
## 4 4
## 5 5
## 6 6
## 7 7
## 8 8
## 9 9
## 10 10

df[2] # single brackets with an index. Result is the same as above - a data frame.
##   x
## 1 1
## 2 2
## 3 3
## 4 4
## 5 5
## 6 6
## 7 7
## 8 8
## 9 9
## 10 10


df$id # dollar-sign notation. Result is a vector of all values in the column
## [1] "a" "b" "c" "d" "e" "f" "g" "h" "i" "j"

df[["x"]] # double square brackets with a name. Result is as above.
## [1] 1 2 3 4 5 6 7 8 9 10

df[[2]] # double square brackets with an index number. Result is as above.
## [1] 1 2 3 4 5 6 7 8 9 10

df[3, 2] # individual indexes for row and column. Result is a vector of length 1.
## [1] 3

df[3,"x"] # the same as above but with the name instead of index.
## [1] 3

# When you access values in a vector, matrix, array, list or data frame names 
# or indexes should not be single values. 
# Moreover, you remember that there are no single values in R - 
# there are always vectors. Hence, you can access or change multiple values at the same time.
x <- c("a", "b", "c", "d", "e", "f")
x
## [1] "a" "b" "c" "d" "e" "f"

x[c(1,3,6)] # an index is a vector with three elements
## [1] "a" "c" "f"

m <- matrix(1:12, nrow=3, ncol=4)
m
##     [,1] [,2] [,3] [,4]
## [1,]   1    4    7   10
## [2,]   2    5    8   11
## [3,]   3    6    9   12

m[c(1,2), c(1,3)] # indexes for rows and columns are vectors
##     [,1] [,2]
## [1,]   1   7
## [2,]   2   8

df <- data.frame(id = letters[1:10], x = 1:10, y = 11:20)
df
##  id x y
## 1 a 1 11
## 2 b 2 12
## 3 c 3 13
## 4 d 4 14
## 5 e 5 15
## 6 f 6 16
## 7 g 7 17
## 8 h 8 18
## 9 i 9 19
## 10 j 10 20

df[c(1,2), c(1,3)] # the same story as with a matrix above
##   id y
## 1 a 11
## 2 b 12

df[c(1,2), c("id", "y")] # now there is a vector of names for columns
##   id y
## 1 a 11
## 2 b 12

# When you deal with two-dimensional (or higher) data structures and 
# you don’t want to make a selection along any particular dimension 
# then you can just drop that index

m <- matrix(1:12, nrow=3, ncol=4)
m
##     [,1] [,2] [,3] [,4]
## [1,]   1    4    7   10
## [2,]   2    5    8   11
## [3,]   3    6    9   12

m[ , c(1,3)] # to take all rows for columns 1 and 3
##     [,1] [,2] 
## [1,]   1    7 
## [2,]   2    8 
## [3,]   3    9

df <- data.frame(id = letters[1:10], x = 1:10, y = 11:20)
df
##   id x   y
## 1  a 1  11
## 2  b 2  12
## 3  c 3  13
## 4  d 4  14
## 5  e 5  15
## 6  f 6  16
## 7  g 7  17
## 8  h 8  18
## 9  i 9  19
## 10 j 10 20

df[ , c("id", "y")] # all rows for columns "id" and "y"
##   id  y
## 1  a 11
## 2  b 12
## 3  c 13
## 4  d 14
## 5  e 15
## 6  f 16
## 7  g 17
## 8  h 18
## 9  i 19
## 10 j 20

df[c(1,3), ] # to take rows 1 and 3 for all columns in the data frame
##   id x   y
## 1  a 1  11
## 2  c 3  13

#There are many data sets embedded in R that can be used as examples. Let’s have a look on one of them
mtcars
head(mtcars) # first 6 rows of the data frame. You can change the number of rows.
tail(mtcars) # last 6 rows of the data frame
ncol(mtcars) # number of columns
nrow(mtcars) # number of rows
dim(mtcars) # dimensions, that is number of rows and columns
names(mtcars) # column names of the data frame
colnames(mtcars) # again, column names
rownames(mtcars) # row names of the data frame
str(mtcars) # structure - name, type and preview of every column
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),L=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`colour <- c("red", "blue", "red", "red")
colour # This is a character vector


# A factor is an integer vector with all characters coded alphabetically 
# (as it is common in R you can change everything).
as.integer(colour_f) # actual data stored as integers
## [1] 2 1 2 2

nlevels(colour_f) # number of levels in the data
## [1] 2

levels(colour_f) # what are the levels
## [1] "blue" "red"
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),U=e("p",null,"Storing character data as a factor is so efficient computationally that R used to do it by default. Each time you create a data frame or load data from external sources, R automatically converts character columns to factors. Most data analytic or predictive functions in R expect that numerical variables presented as numeric and categorical variables presented as factors. However, in some situations that behavior is not desirable and you have to say explicitly that you want to keep characters as characters.",-1),F=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`df <- data.frame(id = letters[1:10], x = 1:10, y = 11:20, stringsAsFactors = FALSE)
df$id
## [1] "a" "b" "c" "d" "e" "f" "g" "h" "i" "j"
class(df$id)
## [1] "character"
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),$=e("p",null,[s("Categorical variables can be nominal or ordinal. Categorical nominal does not have any order, e.g. “red”, “blue”, “green” or “male” and “female”. None of the values is more important or goes ahead of others. Categorical ordinal has an order, some values are above the others, e.g. “high”, “medium”, “low” or “good”, “bad”, “ugly”."),e("br"),s(" In a similar fashion, factors can be ordered and non-ordered. For non-ordered factors (default behavior) levels are assigned alphabetically. For ordered factors, you have to nominate levels and set the parameter "),e("span",{class:"katex"},[e("span",{class:"katex-mathml"},[e("math",{xmlns:"http://www.w3.org/1998/Math/MathML"},[e("semantics",null,[e("mrow",null,[e("mstyle",{mathcolor:"red"},[e("mi",null,"o"),e("mi",null,"r"),e("mi",null,"d"),e("mi",null,"e"),e("mi",null,"r"),e("mi",null,"e"),e("mi",null,"d"),e("mo",null,"="),e("mi",null,"T"),e("mi",null,"R"),e("mi",null,"U"),e("mi",null,"E")]),e("mi",{mathvariant:"normal"},".")]),e("annotation",{encoding:"application/x-tex"},"\\textcolor{red}{ordered=TRUE}.")])])]),e("span",{class:"katex-html","aria-hidden":"true"},[e("span",{class:"base"},[e("span",{class:"strut",style:{height:"0.6944em"}}),e("span",{class:"mord mathnormal",style:{"margin-right":"0.02778em",color:"red"}},"or"),e("span",{class:"mord mathnormal",style:{color:"red"}},"d"),e("span",{class:"mord mathnormal",style:{color:"red"}},"ere"),e("span",{class:"mord mathnormal",style:{color:"red"}},"d"),e("span",{class:"mspace",style:{"margin-right":"0.2778em"}}),e("span",{class:"mrel",style:{color:"red"}},"="),e("span",{class:"mspace",style:{"margin-right":"0.2778em"}})]),e("span",{class:"base"},[e("span",{class:"strut",style:{height:"0.6833em"}}),e("span",{class:"mord mathnormal",style:{"margin-right":"0.00773em",color:"red"}},"TR"),e("span",{class:"mord mathnormal",style:{"margin-right":"0.10903em",color:"red"}},"U"),e("span",{class:"mord mathnormal",style:{"margin-right":"0.05764em",color:"red"}},"E"),e("span",{class:"mord"},".")])])])],-1),j=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`movies <- c("good", "bad", "ugly", "ugly", "good", "good")
movies_f <- factor(movies)
levels(movies_f) # levels were assigned alphabetically
## [1] "bad" "good" "ugly"

movies_f <- factor(movies, levels = c("ugly", "bad", "good"))
levels(movies_f) # levels were manually assigned
## [1] "ugly" "bad" "good"

min(movies_f) # does not work as our factor is non-ordered, there is no min or max


# let's try again
movies_f <- factor(movies, levels = c("ugly", "bad", "good"), ordered = TRUE)
levels(movies_f) # levels were manually assigned and order was set
## [1] "ugly" "bad" "good"
min(movies_f) # now it works as "ugly" is the lowest level
## [1] ugly
## Levels: ugly < bad < good
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),N=l(`<h3 id="logical-indexing" tabindex="-1"><a class="header-anchor" href="#logical-indexing" aria-hidden="true">#</a> Logical indexing</h3><p>You already know how to address data by using indexes and names. There is one more way - using logical or Boolean variables.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>x &lt;- seq(10)
x # integer vector
## [1] 1 2 3 4 5 6 7 8 9 10
y &lt;- c(TRUE,TRUE,TRUE,TRUE,TRUE,FALSE,FALSE,FALSE,FALSE,FALSE)
y # logical vector
## [1] TRUE TRUE TRUE TRUE TRUE FALSE FALSE FALSE FALSE FALSE
x[y] # select values from &quot;x&quot; that correspond to TRUE in &quot;y&quot;
## [1] 1 2 3 4 5

# A logical indexing works for all data structures - vectors, lists, 
# matrices, data frames. You have to pay attention that length of the 
# logical vector used for indexing is the same as the length of the 
# object you try to index.
# Logical vectors can be created using relational operators: &lt;, &gt;, &lt;=, &gt;=, ==, !=, %in%.

df &lt;- data.frame(x = c(1,-2,3,-4,5,-6,7,-8,9,-10), y = letters[1:10])
df
df[df$x &gt; 0, ] # select only rows where value in column &quot;x&quot; is positive

df[df$y %in% c(&quot;a&quot;, &quot;e&quot;, &quot;i&quot;), ] # select row if column &quot;y&quot; value is a vowel

# Logical indexing as other types of indexing can be used for assignment data as well
x &lt;- c(1,-2,3,-4,5,-6,7,-8,9,-10)
x[x &lt; 0] &lt;- 99 # select all values that less than zero and set them to 99
x
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="control-flow" tabindex="-1"><a class="header-anchor" href="#control-flow" aria-hidden="true">#</a> Control flow</h2><p>Control flow in R is very similar of it in Python. There are loops and selections.</p><h3 id="loops-code" tabindex="-1"><a class="header-anchor" href="#loops-code" aria-hidden="true">#</a> Loops code</h3>`,6),M=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`# using for loop to implement the function above
res <- numeric(length = length(x)) # prepare empty vector of the size 10
for(i in seq(1, length(x))){ # iterate through number from 1 to 10
    res[i] <- x[i] + y[i] # do summation for paired values of x and y
}
res # output results
## [1] 12 14 16 18 20 22 24 26 28 30

x <- 1:10 # initial data set
res <- c() # prepare empty vector of length zero
for(i in x){ # iterate through all elements of x
    res <- c(res, i * 2) # add new value to the end of result vector
}
res # output results
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),C=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`x <- 0 # initial value of x
while(x < 5){ # repeat while x is less than 5
    print(x) # print to control the process
    x <- x + 1 # change value of x
}
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),B=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`x <- 0 # optional value to start with
repeat{ # keep repeating till break command
    print(x) # do something
    x <- x + 1 # these 4 lines create a stopping condition
    if(x > 5){
        break
    }
}
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),H=e("div",{class:"hint-container tip"},[e("p",{class:"hint-container-title"},"Custom Title"),e("p",null,[s("An operator "),e("span",{class:"katex"},[e("span",{class:"katex-mathml"},[e("math",{xmlns:"http://www.w3.org/1998/Math/MathML"},[e("semantics",null,[e("mrow",null,[e("mi",null,"b"),e("mi",null,"r"),e("mi",null,"e"),e("mi",null,"a"),e("mi",null,"k")]),e("annotation",{encoding:"application/x-tex"},"break")])])]),e("span",{class:"katex-html","aria-hidden":"true"},[e("span",{class:"base"},[e("span",{class:"strut",style:{height:"0.6944em"}}),e("span",{class:"mord mathnormal"},"b"),e("span",{class:"mord mathnormal"},"re"),e("span",{class:"mord mathnormal",style:{"margin-right":"0.03148em"}},"ak")])])]),s(" can be used in any type of loops to break the loop even if condition in a while loop is still satisfied (TRUE) or a sequence in a for loop is not exhausted yet.")])],-1),I=l(`<div class="hint-container warning"><p class="hint-container-title">Custom Title</p><p>IMPORTANT NOTE! Loops are very inefficient in R. Always try to avoid them if possible, instead, use vectorisation</p></div><h2 id="functions" tabindex="-1"><a class="header-anchor" href="#functions" aria-hidden="true">#</a> Functions</h2><h3 id="built-in-functions" tabindex="-1"><a class="header-anchor" href="#built-in-functions" aria-hidden="true">#</a> Built-in functions</h3><p>When you just started R, several packages were loaded automatically and all functions you used so far were from these packages. You can see the list of loaded packages: <code>print(.packages())</code><br> As you can not memorise all functions, you should be able to find a help on any function you need.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>help.start() # opens a HTML document with major manuals
# and reference list of all packages
help(switch) # opens a help-file for function &quot;switch&quot;
?(switch) # the same as above
help(package=&quot;base&quot;) # opens documentation for chosen package, e.g. &quot;base&quot;
vignette() # gives a list for all available vignettes (tutorials)
# for all installed packages
vignette(topic=&quot;dplyr&quot;, package=&quot;dplyr&quot;) # opens selected vignetts from selected package
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,5),P=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`# generate 100 random numbers from normal distribution with given mean and standard deviation
x <- rnorm(100, mean = 10, sd = 2)
# descriptive statistics
mean(x)
## [1] 10.1993

sd(x)
## [1] 2.070667

median(x)
## [1] 10.11881

IQR(x)
## [1] 2.48354

quantile(x, c(0, 0.25, 0.5, 0.75, 1))
## 0% 25% 50% 75% 100%
## 6.031015 9.079756 10.118812 11.563296 16.342306

# 5-poit descriptive statistics by one function
summary(x)

# plotting - histogram
hist(x)

# plotting - boxplot
boxplot(x)

# t-test that mean equal 10
t.test(x, mu=10)

# download and install package into the default location
install.packages("dplyr")
# load the package into the session, making all its functions available to use
library(dplyr)
As there are so many packages, it is very common to have a conflict between packages when the same
function name use in different packages. To avoid problems you should limit a number of packages you load.
Load only packages you really need for the code you run.
Also, you can specify what particular function from what package you want to run. In this case you don’t
need to load the package.
dplyr::select() # function "select" from package "dplyr"

`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),Y=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`# Here is a short example of some functions that are loaded automatically and always available in R

# download and install package into the default location
install.packages("dplyr")

# load the package into the session, making all its functions available to use
library(dplyr)

# As there are so many packages, it is very common to have a 
# conflict between packages when the same function name use 
# in different packages. To avoid problems you should limit 
# a number of packages you load. Load only packages you really 
# need for the code you run. Also, you can specify what particular 
# function from what package you want to run. In this case you don’t
# need to load the package.
dplyr::select() # function "select" from package "dplyr"
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),D=l(`<h3 id="user-defined-functions" tabindex="-1"><a class="header-anchor" href="#user-defined-functions" aria-hidden="true">#</a> User-defined functions</h3><p>There is a huge number of built-in functions in R. And the number is really HUGE. In fact, no one knows how many functions in R as people keep adding new functions every day. Still, you might need to create your own functions doing something specific to your project and your individual needs. You know all advantages of custom functions: more manageable program development, simpler and easier to understand code, code re-usability, minimised code duplication within the program, better testing, etc.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>function_name &lt;- function(argument1, argument2, ...){
  statement1
  statement2
  ...
  return(object)
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="anonymous-functions" tabindex="-1"><a class="header-anchor" href="#anonymous-functions" aria-hidden="true">#</a> Anonymous functions</h3>`,4),V=e("p",null,[s("Sometimes you might want to create a custom function for a single use. You don’t plan to use this function again and you don’t want to go through a “normal” way of defining a function with the name and "),e("span",{class:"katex"},[e("span",{class:"katex-mathml"},[e("math",{xmlns:"http://www.w3.org/1998/Math/MathML"},[e("semantics",null,[e("mrow",null,[e("mi",null,"r"),e("mi",null,"e"),e("mi",null,"t"),e("mi",null,"u"),e("mi",null,"r"),e("mi",null,"n")]),e("annotation",{encoding:"application/x-tex"},"return")])])]),e("span",{class:"katex-html","aria-hidden":"true"},[e("span",{class:"base"},[e("span",{class:"strut",style:{height:"0.6151em"}}),e("span",{class:"mord mathnormal"},"re"),e("span",{class:"mord mathnormal"},"t"),e("span",{class:"mord mathnormal"},"u"),e("span",{class:"mord mathnormal",style:{"margin-right":"0.02778em"}},"r"),e("span",{class:"mord mathnormal"},"n")])])]),s(" statement. Later you will see more example when this “lazy” function might be very useful. Here is a small preview based on use of build-in function "),e("span",{class:"katex"},[e("span",{class:"katex-mathml"},[e("math",{xmlns:"http://www.w3.org/1998/Math/MathML"},[e("semantics",null,[e("mrow",null,[e("mi",null,"s"),e("mi",null,"a"),e("mi",null,"p"),e("mi",null,"p"),e("mi",null,"l"),e("mi",null,"y")]),e("annotation",{encoding:"application/x-tex"},"sapply")])])]),e("span",{class:"katex-html","aria-hidden":"true"},[e("span",{class:"base"},[e("span",{class:"strut",style:{height:"0.8889em","vertical-align":"-0.1944em"}}),e("span",{class:"mord mathnormal"},"s"),e("span",{class:"mord mathnormal"},"a"),e("span",{class:"mord mathnormal",style:{"margin-right":"0.01968em"}},"ppl"),e("span",{class:"mord mathnormal",style:{"margin-right":"0.03588em"}},"y")])])]),s(".")],-1),W=l(`<div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># create a data frame
df &lt;- data.frame(Column.A=rnorm(100), Column.B=rnorm(100))
head(df)
## Column.A Column.B
## 1 0.04162114 1.3366736
## 2 -0.40900746 -0.8913365
## 3 -0.62365826 0.9140609
## 4 1.32485597 0.1582932
## 5 2.06373481 1.8249187
## 6 0.81531798 -0.2219813

# apply built-in function max() to every column
sapply(df, max)
## Column.A Column.B
## 2.582803 2.122063

# apply built-in function min() to every column
sapply(df, min)
## Column.A Column.B
## -2.037951 -2.687856

# apply a custom anonumous function calculating a difference
sapply(df, function(x) max(x) - min(x))
## Column.A Column.B
## 4.620754 4.809919

# You could do the job above by creating and applying a “normal” function. 
# Also, you could do the same job manually:
sapply(df, max) - sapply(df, min)
## Column.A Column.B
## 4.620754 4.809919

# Results are the same. However, using anonymous function is a more elegant 
# and more powerful way
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="reading-and-writing" tabindex="-1"><a class="header-anchor" href="#reading-and-writing" aria-hidden="true">#</a> Reading and Writing</h2><h3 id="reading-data" tabindex="-1"><a class="header-anchor" href="#reading-data" aria-hidden="true">#</a> Reading data</h3>`,3),z=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`# Function scan() is the most simple and straight-forward function to 
# load data from the file or console. Data will be stored in a vector 
# or a list of vectors, so it is important to control for the same type 
# of data in each vector. Press “Enter” twice to indicate an end of data 
# entry.
numbers <- scan()

# This is a default behavior for scan() to take numerical values from the 
# terminal. Or saying that more precisely, to take values from the terminal 
# and convert them into numbers. You can take character values too and there 
# is not need to use quotation marks in the input.
pets <- scan(what="")

# You can load different data types to be stored in different vectors. In 
# this case, the result is a list of vectors
pets <- scan(what = list("", 0, 0))

# It is possible to use scan() for loading data from the file.
# prepare data file for the example
cat( "TITLE extra line",
     "2 3 5 7",
     "11 13 17", file = "ex.data.txt", sep = "\\n")

# read the text file as numeric (default settings)
my.data <- scan("ex.data.txt", skip = 1, quiet = TRUE)
print(my.data)

# read the text file as character with three columns
# with space as a delimiter (default settings)
my.data <- scan("ex.data.txt", what = list("","",""), skip = 1, nlines=2)

unlink("ex.data.txt") # tidy up - close connection

# Function scan() is a universal function and it can be used to read any 
# text files. There are other functions that do a similar job, for example
# readLines() to read from the file or readline() to read from the terminal.
# However, you will not use these functions too often as there are many 
# specialised functions that can do reading data from files much better.
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),G=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`# Examples in the previous section were about (potentially) unstructured
# data. Very often text files with data are semi-structured data with a 
# fixed number of row and columns. Function read.table() is one of the most
# important for loading data into R. It reads a text file and converts
# loaded data into a data frame.

# read data from the file, use comma as delimiter
# first row has headings and first column has names of rows
my.data <- read.table(file="mtcars.csv", header=TRUE, sep=",", row.names=1)
head(my.data)
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),O=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`# read data from the csv-file
my.data <- read.csv(file="mtcars.csv")
head(my.data)
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),X=l(`<div class="hint-container tip"><p class="hint-container-title">Tips</p><p>Other functions from the same family are <code>read.csv2()</code>, <code>read.delim()</code>, <code>read.delim2()</code>. All of them are based on <code>read.table()</code> with most parameters predefined.</p></div><h4 id="loading-other-data-formats" tabindex="-1"><a class="header-anchor" href="#loading-other-data-formats" aria-hidden="true">#</a> Loading other data formats</h4><p>Data presented to you can be stored in a huge number of different formats and most probably you will be able to find a package that can open that format and load data into R. Here is just a brief list.<br> Text files: Besides the presented functions above from the base package, there are other functions that can do the same job of loading text files and do it better!</p><p><strong>Excel files:</strong> There are several packages to load Excel files that do the job with more or less success:</p><ol><li>xslx</li><li>readxl</li><li>XLConnect</li><li>openxlsx.</li></ol><p>Every package has function <code>read.xlsx()</code> or <code>read_excel()</code> or something similar to allow you to load data from the Excel file including Excel files with multiple working sheets.</p><p><strong>Statistical packages:</strong> R can read files in SAS (sas7bdat). Also, there is a couple universal packages (foreign, haven) that can read different formats at the same time – SAS, SPSS, State, Weka, dBase,Mintab, etc.</p><h3 id="writing-data" tabindex="-1"><a class="header-anchor" href="#writing-data" aria-hidden="true">#</a> Writing data</h3><p>Most of the packages listed above can read and write(!!!) data in these “foreign” formats. Hence, you can create files natively supported by other applications. Look for the functions like (beware of a proper package for each function):</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>write.csv() # CSV format, it is universally supported by all applications
readr::write_csv() # CSV format again
openxlsx::write.xlsx() # Excel
foreign::write.arff() # Weka

#for other statistical packages
foreign::write.foreign(df, datafile, codefile, package = c(&quot;SPSS&quot;, &quot;Stata&quot;, &quot;SAS&quot;), ...)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="read-and-write-data-in-r-format" tabindex="-1"><a class="header-anchor" href="#read-and-write-data-in-r-format" aria-hidden="true">#</a> Read and write data in R-format</h4><p>R has its own format to store data. And “data” mean multiple variables at the same time.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>x &lt;- 2
y &lt;- list(a=1:3, b=LETTERS[1:3])
save(x,y, file=&quot;mydata.RData&quot;) # save two variables
rm(list=ls()) # delete all variables - clean up evrything
load(file=&quot;mydata.RData&quot;) # load stored data
print(y) # check results
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>You can even store your entire working environment with all loaded variables and functions.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>myfun &lt;- function(x){
    print(x)
}
save.image(file=&quot;myimage.RData&quot;) # save the working environment
rm(list=ls()) # delete all variables - clean up evrything
load(file=&quot;myimage.RData&quot;) # restore the working environment
myfun(x) # check results
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="working-directory" tabindex="-1"><a class="header-anchor" href="#working-directory" aria-hidden="true">#</a> Working directory</h2><p>When saving or loading any files, R always look in the working directory unless you specify an absolute path to the file or folder. The last one is a very bad practice. The good approach is to put your files in the working directory and use a relative path.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>getwd() # to check your current working directory
setwd(&quot;C:/Users/tim&quot;) # to set working directory
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>Even better way to deal with working directory is to use RStudio functionality. Go into a menu Session-&gt; Set Working Directory -&gt; To Source File Location. This way your working directory will be the same one where your R-code file is stored.</p><h2 id="warnings-suppression" tabindex="-1"><a class="header-anchor" href="#warnings-suppression" aria-hidden="true">#</a> Warnings Suppression</h2><p>You can change global settings and suppress all warnings from all functions in your code</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>options(warn = -1)
y &lt;- as.numeric(x) # no warning from this function and
print(y) # from any other function in the code
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container tip"><p class="hint-container-title">Tips</p><p>You can run function <code>options()</code> without any parameters to see your current global settings and then you can change any of them. For example, you can change stringsAsFactors to FALSE and avoid hassle with automatic conversion of strings into factors in all data frames mentioned in the previous lecture, and in loading text files discussed above.</p></div><p>You can change settings only for one function you run and keep warnings allowed for all other functions in the code</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>options(warn = 0) # restore warnings on global level
y &lt;- as.numeric(x) # this results in a warning as before
y &lt;- suppressWarnings(as.numeric(x)) # evaluate the function but ignore all warnings
print(y)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="the-apply-family" tabindex="-1"><a class="header-anchor" href="#the-apply-family" aria-hidden="true">#</a> The *apply family</h2><h3 id="apply" tabindex="-1"><a class="header-anchor" href="#apply" aria-hidden="true">#</a> <strong>apply</strong></h3><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>#Syntax: apply(X, MARGIN, FUN, ...)
#@param X an array-type object, e.g. data frame or matrix; 
#@param MARGIN indicates a dimension for applying a function, 
#               1 indicates rows, 
#               2 indicates columns; 
#@param FUN is a function to apply;
#@param ... optional arguments for the function FUN.
# the same data as above, the same results
# however different format - a vector
apply(my.data, 2, mean)

# Using custom functions and even anonymous functions
apply(mtcars, 2, function(x) round(max(x)-min(x), 1))

# apply log trasformation with base 3 to every column
log.cars &lt;- apply(mtcars, 2, log, base=3) 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="sapply-result-is-a-vector" tabindex="-1"><a class="header-anchor" href="#sapply-result-is-a-vector" aria-hidden="true">#</a> <strong>sapply</strong> : result is a vector</h3><p>The function considers elements of the vector or list and applies a function to every element. Hence, it does not require MARGIN parameter as vectors and lists have no dimensionality. The result data structure is a vector.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>my.data &lt;- list(a=rnorm(100), b=letters)
# check the length of every element of my.data, result is a vector
sapply(my.data, length) 

# the same as above but result is a list
lapply(my.data, length) 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="lapply-result-a-list" tabindex="-1"><a class="header-anchor" href="#lapply-result-a-list" aria-hidden="true">#</a> <strong>lapply</strong>: result a list</h3><p>The function considers elements of the vector or list and applies a function to every element. Hence, it does not require MARGIN parameter as vectors and lists have no dimensionality. The result data structure is a list.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>my.data &lt;- list(a=rnorm(100), b=letters)
lapply(my.data, length) # the same as above but result is a list
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="vapply-can-specify-types-of-returned-values" tabindex="-1"><a class="header-anchor" href="#vapply-can-specify-types-of-returned-values" aria-hidden="true">#</a> <strong>vapply</strong>: can <em><strong>specify</strong></em> types of returned values</h3><p>Above three functions are the most popular. However, there are some other members of the family. vapply which is the almost same as sapply but it has an extra parameter FUN.VALUE to specify types of returned values. As a result of the extra information, this function can be safer and sometimes faster to run.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>my.data &lt;- list(a=rnorm(100), b=letters)
# returned value should be an integer
vapply(my.data, FUN=length, FUN.VALUE=0L) 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="tapply-group-results" tabindex="-1"><a class="header-anchor" href="#tapply-group-results" aria-hidden="true">#</a> <strong>tapply</strong>: group results</h3><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>x &lt;- 1:20 # define a vector
print(x)
y &lt;- factor(rep(letters[1:4], each = 5)) # define another vector of the same length
print(y) # there looks to be 4 groups

# get sum of elements of &quot;x&quot; corresponding to groups set by &quot;y&quot;
tapply(x, y, sum) 

# Function tapply can be used for data frames columns too. For example, you can 
# use mtcars data to calculate an average fuel consumption in miles per gallon 
# (US style) for cars with different number of cylinders.
tapply(mtcars$mpg, mtcars$cyl, mean)

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container tip"><p class="hint-container-title">Tips</p><p>While this functionality is <strong>extremely useful</strong>, <code>tapply</code> is not very popular function as this job is a very primitive example of groupby and aggregate functionality and there are functions that can be done this job much-much better. You will see these functions later.</p></div><h3 id="mapply-work-with-multiple-variables-at-the-same-time" tabindex="-1"><a class="header-anchor" href="#mapply-work-with-multiple-variables-at-the-same-time" aria-hidden="true">#</a> <strong>mapply</strong>: work with multiple variables at the same time</h3><p>Function mapply allows to work with multiple variables at the same time and apply a given function to the first element of the every variable, then to the second element of the every variable, to the third . . . , and so on. Results will be combined in one vector.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># prepare data for the example
x &lt;- 1:10; y &lt;- 11:20; z &lt;- 21:30
mapply(sum, x, y, z) # do summation for elements of each variable
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="rapply-works-with-elements-of-the-nested-list-recursively" tabindex="-1"><a class="header-anchor" href="#rapply-works-with-elements-of-the-nested-list-recursively" aria-hidden="true">#</a> <strong>rapply</strong>: works with elements of the nested list recursively</h3><p>Function rapply works with elements of the nested list recursively and you can select format of the result object - a list or a vector.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>
# prepare a nested list - there are three levels of lists
my.data &lt;- list(list(a = 1:10, b = list(c = letters[1:5])), d = &quot;a test&quot;)
rapply(my.data, length, how=&quot;replace&quot;) # replace elements of the original list by the results


rapply(my.data, length, how=&quot;unlist&quot;) # put results in a vector
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="statistical-analysis-descriptive-statistics" tabindex="-1"><a class="header-anchor" href="#statistical-analysis-descriptive-statistics" aria-hidden="true">#</a> <strong>Statistical analysis</strong> - descriptive statistics</h2><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>mean(mtcars$mpg) # mean
sd(mtcars$mpg) # standard deviation
var(mtcars$mpg) # variance

library(moments) # load a library
skewness(mtcars$mpg) # skewness
kurtosis(mtcars$mpg) # kurtosis

# you can get moments of any order
moment(mtcars$mpg, order=2, central = TRUE)

# You can get all main statistics for all columns in your data set at 
# the same time.
fBasics::basicStats(mtcars) # beware of the package required

# another and more detailed version
Hmisc::describe(mtcars) # beware of the package required

# one more version
psych::describe(mtcars) # beware of the package required
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="basic-plotting" tabindex="-1"><a class="header-anchor" href="#basic-plotting" aria-hidden="true">#</a> <strong>Basic plotting</strong></h2>`,49),Q=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`plot(x=mtcars$hp, y=mtcars$mpg, main="Fuel consumption versus Power",
xlab="Power, hp", ylab="Fuel consumption, MpG")
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),J=e("p",null,"Function plot() is a universal one and can be used for many different types of plots.",-1),K=e("h3",{id:"lines-chart",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#lines-chart","aria-hidden":"true"},"#"),s(" Lines chart")],-1),Z=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`plot( x=mtcars$hp, y=mtcars$mpg, type="l", main="Fuel consumption versus Power",
xlab="Power, hp", ylab="Fuel consumption, MpG")
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),ee=e("h3",{id:"combined-chart",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#combined-chart","aria-hidden":"true"},"#"),s(" Combined chart")],-1),ne=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`plot(x=mtcars$hp, y=mtcars$mpg, type="b", main="Fuel consumption versus Power",
xlab="Power, hp", ylab="Fuel consumption, MpG")
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),ie=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`# get average MPG per a number of cylinders by using tapply
temp_mpg_per_cylinder <- tapply(mtcars$mpg, mtcars$cyl, mean)
barplot(temp_mpg_per_cylinder) # plot results

# get counts for cars by number of cylinders and transmission
counts <- table(mtcars$cyl, mtcars$am, dnn=c("cyl", "am"))
counts

barplot(
    counts, 
    main = "Stacked Bar Chart", 
    xlab = "Frequency",
    ylab = "am", 
    col = c("coral", "darkgoldenrod1", "darkolivegreen1"),
    legend = rownames(counts), 
    horiz = TRUE)

barplot(
    counts, 
    main = "Side-by-side Bar Chart", 
    xlab = "am",
    ylab = "Frequency", 
    col = c("coral", "darkgoldenrod1", "darkolivegreen1"),
    legend = rownames(counts), 
    beside = TRUE)
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),ae=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`pie(temp_mpg_per_cylinder)
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"})])],-1),se=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`#example 1
hist(mtcars$mpg)

#example 2
hist(
    mtcars$mpg[mtcars$am == 0], 
    breaks=seq(10,40,4), 
    col=rgb(0,0,1,1/4),
    main="Distribution of fuel consumption \\nfor cars with automatic and manual transmission",
    xlab="Fuel consumption, MpG")
hist(
    mtcars$mpg[mtcars$am == 1], 
    breaks=seq(10,40,4), 
    col=rgb(1,0,0,1/4), 
    add=TRUE)
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),le=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`#example 1
boxplot(mtcars$mpg)

#example 2 - multiple box plots side by side
boxplot(mpg ~ am, data=mtcars)
# Above command uses a so-called “formula” notation. Parameter data nominates 
# a dataframe with the data. Formula mpg ~ am tells that variable mpg from the
# nominated dataframe depends on variable am from the same dataframe. So, you
# get two box plots - one for each category of car transmissions.
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),re=e("p",null,"Extra lines or points can be added to any graph by using functions like lines(), points(), abline(), etc. These functions do not create new plotting window but add elements to the existing graph. Hence, you should have a plotting window available before using these functions.",-1),te=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`hist(mtcars$mpg) # creates a plotting window and put a histogram there
abline(h=5, col="red", lty=2) # add a horisontal line
abline(v=17, col="blue", lwd=6) # add a vertical line
points(x=c(13, 22), y=c(8,2), pch=7, cex=3, col="red") # add points
# prepare data for normal distribution density curve
xfit <- seq(min(mtcars$mpg), max(mtcars$mpg), length = 40)
yfit <- dnorm(xfit, mean = mean(mtcars$mpg), sd = sd(mtcars$mpg))
yfit <- yfit * length(mtcars$mpg) * 5
lines(xfit, yfit, col = "green", lwd = 2) # add a custom line
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),de=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`# create a graphics space that allows for 4 plots in total,
# 2 graphs in the each of 2 rows
par(mfrow = c(2, 2))
# create 4 plots
temp_mpg_per_cylinder <- tapply(mtcars$mpg, mtcars$cyl, mean)
hist(mtcars$mpg, main = "Histogram")
boxplot(mpg ~ am, data=mtcars, main = "Box plot")
plot(x=mtcars$hp, y=mtcars$mpg, main = "Scatter plot")
pie(temp_mpg_per_cylinder, main = "Pie chart")
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),ce=l(`<h2 id="random-numbers-generation" tabindex="-1"><a class="header-anchor" href="#random-numbers-generation" aria-hidden="true">#</a> Random numbers generation</h2><h3 id="normal-distribution" tabindex="-1"><a class="header-anchor" href="#normal-distribution" aria-hidden="true">#</a> Normal distribution</h3><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># 1000 numbers from Normal distribution with mean 10 and standard deviation 2
x &lt;- rnorm(1000, 10, 2)
summary(x) # one more possible way to get summary statistics
hist(x, breaks=20, main = &quot;Normal distribution&quot;)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="uniform-distribution" tabindex="-1"><a class="header-anchor" href="#uniform-distribution" aria-hidden="true">#</a> Uniform distribution</h3><p>Example 1</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>x &lt;- runif(10000) # 10,000 numbers uniformely distributed between 0 and 1
summary(x) # one more possible way to get summary statistics
hist(x, breaks=20, main = &quot;Uniform distribution&quot;)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Example 2</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># create 12 sets (columns) of 10000 uniformly distributed numbers each
x &lt;- matrix(runif(120000), nrow=10000, ncol=12)
# sum up all 12 columns
y &lt;- apply(x, 1, sum)
hist(y, breaks=100, main=&quot;Histogram of summation of 12 uniform distributions&quot;)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="hint-container tip"><p class="hint-container-title">Tips</p><p>Try to type <code>?Distributions</code> to see a full list of distributions included in stats package loaded in R by default.</p></div><h3 id="stable-distribution" tabindex="-1"><a class="header-anchor" href="#stable-distribution" aria-hidden="true">#</a> Stable distribution</h3><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>x &lt;- stable::rstable(1000, disp = 1, tail = 1.9) # beware of the package used
hist(x, breaks=50, main=&quot;Histogram of stable distribution&quot;)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div>`,11);function oe(ue,me){const d=c("Tabs"),t=c("CodeTabs");return u(),m("div",null,[b,e("details",h,[p,r(d,{id:"67",data:[{id:"Vector"},{id:"List"},{id:"Matrix"},{id:"Data frame"},{id:"Factors"}]},{title0:n(({value:i,isActive:a})=>[s("Vector")]),title1:n(({value:i,isActive:a})=>[s("List")]),title2:n(({value:i,isActive:a})=>[s("Matrix")]),title3:n(({value:i,isActive:a})=>[s("Data frame")]),title4:n(({value:i,isActive:a})=>[s("Factors")]),tab0:n(({value:i,isActive:a})=>[g,f,y,x,w,R,k]),tab1:n(({value:i,isActive:a})=>[_,A]),tab2:n(({value:i,isActive:a})=>[T,q,E]),tab3:n(({value:i,isActive:a})=>[S]),tab4:n(({value:i,isActive:a})=>[L,U,F,$,j]),_:1})]),N,r(t,{id:"159",data:[{id:"for"},{id:"while"},{id:"repeat"}]},{title0:n(({value:i,isActive:a})=>[s("for")]),title1:n(({value:i,isActive:a})=>[s("while")]),title2:n(({value:i,isActive:a})=>[s("repeat")]),tab0:n(({value:i,isActive:a})=>[M]),tab1:n(({value:i,isActive:a})=>[C]),tab2:n(({value:i,isActive:a})=>[B]),_:1}),H,I,r(t,{id:"190",data:[{id:"Basic functions"},{id:"Basic Packages"}]},{title0:n(({value:i,isActive:a})=>[s("Basic functions")]),title1:n(({value:i,isActive:a})=>[s("Basic Packages")]),tab0:n(({value:i,isActive:a})=>[P]),tab1:n(({value:i,isActive:a})=>[Y]),_:1}),D,V,W,r(t,{id:"218",data:[{id:"scan()"},{id:"read.table()"},{id:"read.csv()"}]},{title0:n(({value:i,isActive:a})=>[s("scan()")]),title1:n(({value:i,isActive:a})=>[s("read.table()")]),title2:n(({value:i,isActive:a})=>[s("read.csv()")]),tab0:n(({value:i,isActive:a})=>[z]),tab1:n(({value:i,isActive:a})=>[G]),tab2:n(({value:i,isActive:a})=>[O]),_:1},8,["data"]),X,r(d,{id:"373",data:[{id:"Scatter Plot"},{id:"Bar chart"},{id:"Pie chart"},{id:"Histogram"},{id:"Box plot"},{id:"Adding extra elements"},{id:"Multiple graphs"}]},{title0:n(({value:i,isActive:a})=>[s("Scatter Plot")]),title1:n(({value:i,isActive:a})=>[s("Bar chart")]),title2:n(({value:i,isActive:a})=>[s("Pie chart")]),title3:n(({value:i,isActive:a})=>[s("Histogram")]),title4:n(({value:i,isActive:a})=>[s("Box plot")]),title5:n(({value:i,isActive:a})=>[s("Adding extra elements")]),title6:n(({value:i,isActive:a})=>[s("Multiple graphs")]),tab0:n(({value:i,isActive:a})=>[Q,J,K,Z,ee,ne]),tab1:n(({value:i,isActive:a})=>[ie]),tab2:n(({value:i,isActive:a})=>[ae]),tab3:n(({value:i,isActive:a})=>[se]),tab4:n(({value:i,isActive:a})=>[le]),tab5:n(({value:i,isActive:a})=>[re,te]),tab6:n(({value:i,isActive:a})=>[de]),_:1}),ce])}const he=o(v,[["render",oe],["__file","01.R Language.html.vue"]]);export{he as default};
