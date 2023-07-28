import{_ as c}from"./plugin-vue_export-helper-c27b6911.js";import{r as t,o as u,c as v,b as e,d as n,e as l,w as i,f as d}from"./app-49149863.js";const m={},b=d(`<h2 id="description" tabindex="-1"><a class="header-anchor" href="#description" aria-hidden="true">#</a> Description</h2><p>Data manipulation using R refers to the process of transforming, cleaning, aggregating, and reorganizing data to extract valuable insights or prepare it for further analysis. This article mainly talk about several packages for data processing using R.</p><h2 id="base-package" tabindex="-1"><a class="header-anchor" href="#base-package" aria-hidden="true">#</a> Base package</h2><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># take rows with 4 cylinders or less and select only columns &quot;mpg&quot; and &quot;hp&quot;
df_small &lt;- df[df$cyl &lt;= 4, c(&quot;mpg&quot;, &quot;hp&quot;)]
head(df_small, 5) # check top 5 lines of the new data frame


# take rows with 4 cylinders or less and select only columns &quot;mpg&quot; and &quot;hp&quot;
df_small &lt;- df[df$cyl &lt;= 4, c(&quot;mpg&quot;, &quot;hp&quot;)]
head(df_small, 5) # check top 5 lines of the new data frame
##              mpg hp
## Datsun 710  22.8 93
## Merc 240D   24.4 62
## Merc 230    22.8 95
## Fiat 128    32.4 66
## Honda Civic 30.4 52


# the same result can be achieved by function &quot;subset()&quot;
df_small &lt;- subset(df, subset = df$cyl &lt;= 4, select = c(&quot;mpg&quot;, &quot;hp&quot;))
head(df_small, 5) # check top 5 lines of the new data frame
##              mpg hp
## Datsun 710  22.8 93
## Merc 240D   24.4 62
## Merc 230    22.8 95
## Fiat 128    32.4 66
## Honda Civic 30.4 52

# adding new columns to the data frame
df$model &lt;- rownames(df) # store rownames as a column
head(df, 5)

# select all rows but only some columns
x1 &lt;- df[ , -c(1:8)] # select all columns except first 8 columns
x2 &lt;- df[ , c(&quot;mpg&quot;, &quot;hp&quot;, &quot;cyl&quot;, &quot;model&quot;)] # select four columns with given names
# combine or join together two data frames by a common variable
df_new &lt;- merge(x1, x2, by = &quot;model&quot;)
head(df_new, 5)
##                model am gear carb  mpg  hp cyl
## 1        AMC Javelin  0    3    2 15.2 150   8
## 2 Cadillac Fleetwood  0    3    4 10.4 205   8
## 3         Camaro Z28  0    3    4 13.3 245   8
## 4  Chrysler Imperial  0    3    4 14.7 230   8
## 5         Datsun 710  1    4    1 22.8  93   4

# group by two variables and make aggregation for other two variables
aggregate(cbind(mpg, hp) ~ am + cyl, data = df_new, FUN = &quot;mean&quot;)
##  am cyl      mpg        hp
## 1 0   4 22.90000  84.66667
## 2 1   4 28.07500  81.87500
## 3 0   6 19.12500 115.25000
## 4 1   6 20.56667 131.66667
## 5 0   8 15.05000 194.16667
## 6 1   8 15.40000 299.50000

# if you need to summarise only one variable, even tapply will do the job
# of grouping and making aggregation
tapply(mtcars$mpg, mtcars[, c(&quot;cyl&quot;, &quot;am&quot;)], mean)
##   am
##cyl      0        1
##  4 22.900 28.07500
##  6 19.125 20.56667
##  8 15.050 15.40000
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="package-tidyverse" tabindex="-1"><a class="header-anchor" href="#package-tidyverse" aria-hidden="true">#</a> Package Tidyverse</h2><p>The <code>tidyverse</code> is a <span style="color:orange;">collection of packages</span> that use the same approach to data manipulation in R and allows to do many things in a better and more efficient way. You can install a package <code>tidyverse</code> and get a set of 8 core packages, or you can install and then load each package individually when you need it.</p><p>You had already seen one package from <code>tidyverse</code> collection - it was ready for reading and writing csv files. Later, you will get ggplot2 - the best tool for data visualisation, stringr for working with text and some others. This lecture topic is mostly about data frames transformation and package <code>dplyr</code>.</p><h3 id="dplyr" tabindex="-1"><a class="header-anchor" href="#dplyr" aria-hidden="true">#</a> dplyr</h3>`,8),g={href:"https://dplyr.tidyverse.org/",target:"_blank",rel:"noopener noreferrer"},p=e("code",null,"dplyr",-1),h=d(`<h4 id="main-functions" tabindex="-1"><a class="header-anchor" href="#main-functions" aria-hidden="true">#</a> Main functions</h4><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># load the library before you can use it
# and suppress messages as there are too many of them
suppressMessages(library(dplyr))
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2),f=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`# to pick rows by given criteria
# take only rows with number of cylinders equal 4
df_small <- filter(mtcars, cyl == 4)
head(df_small)
##                 mpg cyl  disp hp drat    wt  qsec vs am gear carb
## Datsun 710     22.8   4 108.0 93 3.85 2.320 18.61  1  1    4    1
## Merc 240D      24.4   4 146.7 62 3.69 3.190 20.00  1  0    4    2
## Merc 230       22.8   4 140.8 95 3.92 3.150 22.90  1  0    4    2
## Fiat 128       32.4   4  78.7 66 4.08 2.200 19.47  1  1    4    1
## Honda Civic    30.4   4  75.7 52 4.93 1.615 18.52  1  1    4    2
## Toyota Corolla 33.9   4  71.1 65 4.22 1.835 19.90  1  1    4    1
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),y=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`# to reorder rows by the values in one or multiple variables
# arrange rows by the value of mpg in the ascending order (from smallest to largest)
arrange(df_small, mpg)
##                 mpg cyl  disp  hp drat    wt  qsec vs am gear carb
## Volvo 142E     21.4   4 121.0 109 4.11 2.780 18.60  1  1    4    2
## Toyota Corona  21.5   4 120.1  97 3.70 2.465 20.01  1  0    3    1
## Datsun 710     22.8   4 108.0  93 3.85 2.320 18.61  1  1    4    1
## Merc 230       22.8   4 140.8  95 3.92 3.150 22.90  1  0    4    2
## Merc 240D      24.4   4 146.7  62 3.69 3.190 20.00  1  0    4    2
## Porsche 914-2  26.0   4 120.3  91 4.43 2.140 16.70  0  1    5    2
## Fiat X1-9      27.3   4  79.0  66 4.08 1.935 18.90  1  1    4    1
## Honda Civic    30.4   4  75.7  52 4.93 1.615 18.52  1  1    4    2
## Lotus Europa   30.4   4  95.1 113 3.77 1.513 16.90  1  1    5    2
## Fiat 128       32.4   4  78.7  66 4.08 2.200 19.47  1  1    4    1
## Toyota Corolla 33.9   4  71.1  65 4.22 1.835 19.90  1  1    4    1

# arrange rows by the value of mpg in the descending order (from largest to smallest)
# with the help of function desc()
arrange(df_small, desc(mpg))
##                 mpg cyl  disp  hp drat    wt  qsec vs am gear carb
## Toyota Corolla 33.9   4  71.1  65 4.22 1.835 19.90  1  1    4    1
## Fiat 128       32.4   4  78.7  66 4.08 2.200 19.47  1  1    4    1
## Honda Civic    30.4   4  75.7  52 4.93 1.615 18.52  1  1    4    2
## Lotus Europa   30.4   4  95.1 113 3.77 1.513 16.90  1  1    5    2
## Fiat X1-9      27.3   4  79.0  66 4.08 1.935 18.90  1  1    4    1
## Porsche 914-2  26.0   4 120.3  91 4.43 2.140 16.70  0  1    5    2
## Merc 240D      24.4   4 146.7  62 3.69 3.190 20.00  1  0    4    2
## Datsun 710     22.8   4 108.0  93 3.85 2.320 18.61  1  1    4    1
## Merc 230       22.8   4 140.8  95 3.92 3.150 22.90  1  0    4    2
## Toyota Corona  21.5   4 120.1  97 3.70 2.465 20.01  1  0    3    1
## Volvo 142E     21.4   4 121.0 109 4.11 2.780 18.60  1  1    4    2
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),_=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`# to pick variables/columns by their names
# select only some columns (cyl, hp, mpg) from the original data frame
df_narrow <- select(mtcars, cyl, hp, mpg) # columns appear in this order
head(df_narrow)
##                   cyl  hp  mpg
## Mazda RX4           6 110 21.0
## Mazda RX4 Wag       6 110 21.0
## Datsun 710          4  93 22.8
## Hornet 4 Drive      6 110 21.4
## Hornet Sportabout   8 175 18.7
## Valiant             6 105 18.1
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),q=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`# to create new variables
# create a new column and set its values to rows names
# then create another column with miles per gallon per one horse power
df <- mutate(mtcars, model = rownames(mtcars), mpghp = mpg / hp)
# check the results and see two new columns
head(df)
##                    mpg cyl disp  hp drat    wt  qsec vs am gear carb             model     mpghp
## Mazda RX4         21.0   6  160 110 3.90 2.620 16.46  0  1    4    4         Mazda RX4 0.1909091
## Mazda RX4 Wag     21.0   6  160 110 3.90 2.875 17.02  0  1    4    4     Mazda RX4 Wag 0.1909091
## Datsun 710        22.8   4  108  93 3.85 2.320 18.61  1  1    4    1        Datsun 710 0.2451613
## Hornet 4 Drive    21.4   6  258 110 3.08 3.215 19.44  1  0    3    1    Hornet 4 Drive 0.1945455
## Hornet Sportabout 18.7   8  360 175 3.15 3.440 17.02  0  0    3    2 Hornet Sportabout 0.1068571
## Valiant           18.1   6  225 105 2.76 3.460 20.22  1  0    3    1           Valiant 0.1723810
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),w=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`# to aggregate multiple values to a single summary
# aggreagate all rows in to a single statistical summary
# n is a number of observations
# mu_mpg and sd_mpg are mean and standard deviations of miles per gallon
# median_hp is a median of horse power variable
# there can be any other summaries for any other variable
summarise(df, n = n(), mu_mpg = mean(mpg), sd_mpg = sd(mpg), median_hp = median(hp))
##    n   mu_mpg   sd_mpg median_hp
## 1 32 20.09062 6.026948       123
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),R=e("div",{class:"language-R line-numbers-mode","data-ext":"R"},[e("pre",{class:"language-R"},[e("code",null,`#  to change the scope of the above functions from the full data set into multiple groups organised by values in one or multiple variables.
# All function above worked with the full data set. However, you might want to split 
# the data frame into some groups and then run the function for each group separately. 
# Function group_by() would be handy here

# group the data frame by two variables at the same time - "cyl" and "am"
df <- group_by(mtcars, cyl, am)
# aggreagate all rows in the each group [!] in to a single statistical summary
# hence there is a row with a summary for each group
summarise(df, n = n(), mu_mpg = mean(mpg), sd_mpg = sd(mpg), median_hp = median(hp))
## # A tibble: 6 × 6
## # Groups:   cyl [3]
##     cyl    am     n mu_mpg sd_mpg median_hp
##   <dbl> <dbl> <int>  <dbl>  <dbl>     <dbl>
## 1     4     0     3   22.9  1.45       95  
## 2     4     1     8   28.1  4.48       78.5
## 3     6     0     4   19.1  1.63      116. 
## 4     6     1     3   20.6  0.751     110  
## 5     8     0    12   15.0  2.77      180  
## 6     8     1     2   15.4  0.566     300.
`)]),e("div",{class:"line-numbers","aria-hidden":"true"},[e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"}),e("div",{class:"line-number"})])],-1),k=d(`<h4 id="comprehensive-use" tabindex="-1"><a class="header-anchor" href="#comprehensive-use" aria-hidden="true">#</a> comprehensive use</h4><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>
# group the data frame in three groups by a number of cylinders
df &lt;- group_by(mtcars, cyl)
# create a new column with miles per gallon
# per the average [!] horse power in the corresponding group
df &lt;- mutate(df, mpghp = mpg / mean(hp))
# check top 5 rows of the resulted data frame
head(df, 5)
## # A tibble: 5 × 12
## # Groups:   cyl [3]
##     mpg   cyl  disp    hp  drat    wt  qsec    vs    am  gear  carb  mpghp
##   &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt;  &lt;dbl&gt;
## 1  21       6   160   110  3.9   2.62  16.5     0     1     4     4 0.172 
## 2  21       6   160   110  3.9   2.88  17.0     0     1     4     4 0.172 
## 3  22.8     4   108    93  3.85  2.32  18.6     1     1     4     1 0.276 
## 4  21.4     6   258   110  3.08  3.22  19.4     1     0     3     1 0.175 
## 5  18.7     8   360   175  3.15  3.44  17.0     0     0     3     2 0.0894



df &lt;- select(mtcars, cyl, am, mpg, hp) # select only 4 columns to make more compact example
df &lt;- group_by(df, cyl, am) # group a data frame by two variables
df &lt;- arrange(df, mpg, .by_group = TRUE) # sort every group by value of &quot;mpg&quot;
head(df, 12)
## # A tibble: 12 × 4
## # Groups:   cyl, am [3]
##      cyl    am   mpg    hp
##    &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt;
##  1     4     0  21.5    97
##  2     4     0  22.8    95
##  3     4     0  24.4    62
##  4     4     1  21.4   109
##  5     4     1  22.8    93
##  6     4     1  26      91
##  7     4     1  27.3    66
##  8     4     1  30.4    52
##  9     4     1  30.4   113
## 10     4     1  32.4    66
## 11     4     1  33.9    65
## 12     6     0  17.8   123

summarise(df, mpg_mu = mean(mpg), hp_median = median(hp)) # summary for each group
## # A tibble: 6 × 4
## # Groups:   cyl [3]
##     cyl    am mpg_mu hp_median
##   &lt;dbl&gt; &lt;dbl&gt;  &lt;dbl&gt;     &lt;dbl&gt;
## 1     4     0   22.9      95  
## 2     4     1   28.1      78.5
## 3     6     0   19.1     116. 
## 4     6     1   20.6     110  
## 5     8     0   15.0     180  
## 6     8     1   15.4     300.

summarise(ungroup(df), # data frame is ungrouped
          mpg_mu = mean(mpg), hp_median = median(hp)) # summary for a full data frame
## # A tibble: 1 × 2
##   mpg_mu hp_median
##    &lt;dbl&gt;     &lt;dbl&gt;
## 1   20.1       123

# Functions group_by() and summarise() are two most common functions
# to go together and they make a replacement for the function aggregate()
# presented in the beginning but with much better performance for large
# data sets and much higher flexibility.

# group by two variable and make aggregation for two other variables
aggregate(cbind(mpg, hp) ~ am + cyl, data = mtcars, FUN = &quot;mean&quot;)

# exact replication of the above example with aggregate()
temp &lt;- group_by(mtcars, cyl, am)
summarise(temp, mpg = mean(mpg), hp = mean(hp))
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>The syntax of all functions is the same. The first element is a data frame. The subsequent arguments are instructions on what to do with the data using variable names without quotation marks. The result of these functions is a data frame too.</p><p>Fine print note: in reality, the result of all functions in dplyr is not always a data frame, it can be an object of class tibble introduced by the package with the same name from the tidyverse collection. Tibble is an enhanced version of a data frame and from the practical point you can think about it and treat it as a data frame. Also, for some functions the result might be of a different data type. However, in the most situations dplyr is about data frames getting in and out.</p><h3 id="piping" tabindex="-1"><a class="header-anchor" href="#piping" aria-hidden="true">#</a> Piping</h3><p>The data frame which used to be the first parameter of all <code>dplyr</code> functions disappeared. The reason is that whatever object you pipe into a function, becomes the first parameter to take variables from and to apply functions.</p><p>The original data frame can be assessed by every function even if it is not mentioned explicitly. You can do it by operator (.) - just dot. In the example below, there is a new variable created with the number of rows in the original data frame.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>mtcars %&gt;% # take the data frame for piping
  select(mpg, hp) %&gt;% # select two variables - just to make an output shorter
  mutate(nn = nrow(.)) %&gt;% # create a new column with the value of rows count
  head(5) # see top 5 rows of the resulted data frame
##                    mpg  hp nn
## Mazda RX4         21.0 110 32
## Mazda RX4 Wag     21.0 110 32
## Datsun 710        22.8  93 32
## Hornet 4 Drive    21.4 110 32
## Hornet Sportabout 18.7 175 32

# Function nrow() is a part of the base package and it would not know 
# how to work in dplyr environment. Operator (.) makes a bridge between
# base and dplyr and allows to assess the data frame used as the “original”
# first attribute in the function.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Piping is available in many programming languages and it was introduced in R by packages <code>magrittr</code> and <code>pipeR</code>. Package <code>dplyr</code> has only one piping operator <code>%&gt;%</code>. If you check the other two packages, you find several other piping operators. For example, * <code>%&gt;&gt;%</code> claimed to be “somewhat” quicker and has multiple “alternative” ways to use piping. Check the help file by <code>help(&quot;%&gt;&gt;%&quot;)</code> after loading package <code>pipeR</code>. * <code>%T&gt;%</code> Tee operator to split the data flow and put the same data frame into two different functions. * <code>%$%</code> Exposition operator to pipe not a full data set but allow the following function to access (or expose) individual variables from it.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>library(magrittr)
mtcars %&gt;% # data frame to start with
  select(mpg, hp) %T&gt;% # select two columns of interest only and pipe them
  plot(.) %&gt;% # in both: function plot() for plotting and
  colMeans() # function colMeans() to get averages

# &quot;expose&quot; columns from the data frame as separate variables
# to use with a basic function
mtcars %$% cor(mpg, hp)

# similar task with dplyr functionality results in a matrx
# as cor() takes all possible correlations in the data frame
mtcars %&gt;%
  select(mpg, hp) %&gt;%
  cor

library(pipeR)
mtcars$mpg %&gt;&gt;% # take variable &quot;mpg&quot; only
  sample(size = 10000, replace = TRUE) %&gt;&gt;% # make a random draw with replacement
  density(kernel = &quot;gaussian&quot;) %&gt;&gt;% # calculate density function
  plot(main = &quot;density of mpg (bootstrap)&quot;) # plot the resu


library(pipeR)
apply(
  1:10ˆ6, # below function will be repeated 1,000,000 times
  function(i) {
    sample(LETTERS, 4, replace = F) %&gt;&gt;% # draw 4 letters
    paste(collapse = &quot;&quot;) %&gt;&gt;% # concatenate them
    &quot;==&quot;(&quot;COMP&quot;)
}) %&gt;&gt;% # check if result is COMP
  sum # check how many times there is an equality

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="joining-data" tabindex="-1"><a class="header-anchor" href="#joining-data" aria-hidden="true">#</a> Joining data</h3><p>Package base has a function <code>merge()</code>, <code>dplyr</code> brings a set of join functions.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>band_members # data frame 1
band_instruments # data frame 2
# provide first and second data frames to join
# or other names - left and right data frames
inner_join(band_members, band_instruments, by = &quot;name&quot;)
## # A tibble: 2 × 3
##   name  band    plays 
##   &lt;chr&gt; &lt;chr&gt;   &lt;chr&gt; 
## 1 John  Beatles guitar
## 2 Paul  Beatles bass

# an alternative is to use piping
# left data frame is piped into a function with right data frame provided as a parameter
band_members %&gt;% inner_join(band_instruments, by=&quot;name&quot;)
## # A tibble: 2 × 3
##   name  band    plays 
##   &lt;chr&gt; &lt;chr&gt;   &lt;chr&gt; 
## 1 John  Beatles guitar
## 2 Paul  Beatles bass

# outer join - keep all rows from both data frames and fill missing cells by NA
band_members %&gt;% full_join(band_instruments, by=&quot;name&quot;)
## # A tibble: 4 × 3
##   name  band    plays 
##   &lt;chr&gt; &lt;chr&gt;   &lt;chr&gt; 
## 1 Mick  Stones  NA    
## 2 John  Beatles guitar
## 3 Paul  Beatles bass  
## 4 Keith NA      guitar

# left join - keep all rows from the left data frame and only common from the right one
band_members %&gt;% left_join(band_instruments, by=&quot;name&quot;)
## # A tibble: 3 × 3
##   name  band    plays 
##   &lt;chr&gt; &lt;chr&gt;   &lt;chr&gt; 
## 1 Mick  Stones  NA    
## 2 John  Beatles guitar
## 3 Paul  Beatles bass

# right join - keep all rows from the right data frame and only common from the left one
band_members %&gt;% right_join(band_instruments, by=&quot;name&quot;)
## # A tibble: 3 × 3
##   name  band    plays 
##   &lt;chr&gt; &lt;chr&gt;   &lt;chr&gt; 
## 1 John  Beatles guitar
## 2 Paul  Beatles bass  
## 3 Keith NA      guitar

# prepare data for the example
df1 &lt;- starwars %&gt;% select(name, height, gender, homeworld, species)
df2 &lt;- starwars %&gt;% select(mass, height, gender, homeworld, species)
df3 &lt;- starwars %&gt;% select(name, hair_color, skin_color, eye_color)

#### try to join that data back
# we can not use a single variable to join as their values are not unique
# result of the joining would be not what you expected, e.g.
df1 %&gt;% inner_join(df2, by=&quot;gender&quot;) %&gt;% head(5)


# however, using multiple common variables might be more productive
df1 %&gt;% inner_join(df2, by=c(&quot;height&quot;, &quot;gender&quot;, &quot;homeworld&quot;, &quot;species&quot;)) %&gt;% head(5)

# joining three data frames by piping result of the first join into the second one
df1 %&gt;%
  inner_join(df2, by=c(&quot;height&quot;, &quot;gender&quot;, &quot;homeworld&quot;, &quot;species&quot;)) %&gt;%
  inner_join(df3, by=&quot;name&quot;) %&gt;%
  head(5)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="other-functions" tabindex="-1"><a class="header-anchor" href="#other-functions" aria-hidden="true">#</a> Other functions</h3><h4 id="mutate" tabindex="-1"><a class="header-anchor" href="#mutate" aria-hidden="true">#</a> mutate*</h4><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># create a small data set for the example
df &lt;- mtcars %&gt;% select(mpg, hp, cyl)
head(df)
##                    mpg  hp cyl
## Mazda RX4         21.0 110   6
## Mazda RX4 Wag     21.0 110   6
## Datsun 710        22.8  93   4
## Hornet 4 Drive    21.4 110   6
## Hornet Sportabout 18.7 175   8
## Valiant           18.1 105   6

# do summation for each column and get new columns
df %&gt;% mutate_all(list(mysum = ~ sum(.))) %&gt;% head(5)
##                    mpg  hp cyl mpg_mysum hp_mysum cyl_mysum
## Mazda RX4         21.0 110   6     642.9     4694       198
## Mazda RX4 Wag     21.0 110   6     642.9     4694       198
## Datsun 710        22.8  93   4     642.9     4694       198
## Hornet 4 Drive    21.4 110   6     642.9     4694       198
## Hornet Sportabout 18.7 175   8     642.9     4694       198

# normalise each column
df %&gt;% mutate_all(list(norm = ~ scale(.))) %&gt;% head(5)
##                    mpg  hp cyl   mpg_norm    hp_norm   cyl_norm
## Mazda RX4         21.0 110   6  0.1508848 -0.5350928 -0.1049878
## Mazda RX4 Wag     21.0 110   6  0.1508848 -0.5350928 -0.1049878
## Datsun 710        22.8  93   4  0.4495434 -0.7830405 -1.2248578
## Hornet 4 Drive    21.4 110   6  0.2172534 -0.5350928 -0.1049878
## Hornet Sportabout 18.7 175   8 -0.2307345  0.4129422  1.0148821

# mutate only selected columns, which names can be provided as character vector
my_cols &lt;- c(&quot;hp&quot;, &quot;mpg&quot;)
df %&gt;% mutate_at(my_cols, list(norm = ~ scale(.))) %&gt;% head(5)
##                    mpg  hp cyl    hp_norm   mpg_norm
## Mazda RX4         21.0 110   6 -0.5350928  0.1508848
## Mazda RX4 Wag     21.0 110   6 -0.5350928  0.1508848
## Datsun 710        22.8  93   4 -0.7830405  0.4495434
## Hornet 4 Drive    21.4 110   6 -0.5350928  0.2172534
## Hornet Sportabout 18.7 175   8  0.4129422 -0.2307345

# mutate only columns that satisfy some criteria
# if column is type double - convert it to character
df %&gt;% mutate_if(is.double, as.character) %&gt;% head(5)
##                    mpg  hp cyl
## Mazda RX4           21 110   6
## Mazda RX4 Wag       21 110   6
## Datsun 710        22.8  93   4
## Hornet 4 Drive    21.4 110   6
## Hornet Sportabout 18.7 175   8


####################################################
# mutate only columns according to &quot;fancy&quot; criteria
# and then use multiple functions for transformation
# prepare a custom function that return TRUE or FALSE for the column
my_test &lt;- function(x) { any(x &gt; 10) }
# use that &quot;fancy&quot; function to select columns for mutation
df %&gt;% mutate_if(my_test, list(norm = ~ scale(.), sqrt = ~ sqrt(.))) %&gt;% head(5)
##                    mpg  hp cyl   mpg_norm    hp_norm mpg_sqrt   hp_sqrt
## Mazda RX4         21.0 110   6  0.1508848 -0.5350928 4.582576 10.488088
## Mazda RX4 Wag     21.0 110   6  0.1508848 -0.5350928 4.582576 10.488088
## Datsun 710        22.8  93   4  0.4495434 -0.7830405 4.774935  9.643651
## Hornet 4 Drive    21.4 110   6  0.2172534 -0.5350928 4.626013 10.488088
## Hornet Sportabout 18.7 175   8 -0.2307345  0.4129422 4.324350 13.228757
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="transmute" tabindex="-1"><a class="header-anchor" href="#transmute" aria-hidden="true">#</a> transmute*</h4><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># simple alternative to mutate() - result is one column only
df %&gt;% transmute(new_mpg = mpgˆ2) %&gt;% head(5)
# error occurs

# create and keep only normalised versions of all variables
df %&gt;% transmute_all(list(norm = ~ scale(.))) %&gt;% head(5)
##                     mpg_norm    hp_norm   cyl_norm
## Mazda RX4          0.1508848 -0.5350928 -0.1049878
## Mazda RX4 Wag      0.1508848 -0.5350928 -0.1049878
## Datsun 710         0.4495434 -0.7830405 -1.2248578
## Hornet 4 Drive     0.2172534 -0.5350928 -0.1049878
## Hornet Sportabout -0.2307345  0.4129422  1.0148821

# create and keep normalised versions of selected variables only
my_cols &lt;- c(&quot;hp&quot;, &quot;mpg&quot;)
df %&gt;% transmute_at(my_cols, list(norm = ~ scale(.))) %&gt;% head(5)
##                      hp_norm   mpg_norm
## Mazda RX4         -0.5350928  0.1508848
## Mazda RX4 Wag     -0.5350928  0.1508848
## Datsun 710        -0.7830405  0.4495434
## Hornet 4 Drive    -0.5350928  0.2172534
## Hornet Sportabout  0.4129422 -0.2307345

# use a custom function to select columns for mutation
# and keep only new variables
my_test &lt;- function(x) { any(x &gt; 10) }
df %&gt;% transmute_if(my_test, list(norm = ~ scale(.), sqrt = ~ sqrt(.))) %&gt;% head(5)
##                     mpg_norm    hp_norm mpg_sqrt   hp_sqrt
## Mazda RX4          0.1508848 -0.5350928 4.582576 10.488088
## Mazda RX4 Wag      0.1508848 -0.5350928 4.582576 10.488088
## Datsun 710         0.4495434 -0.7830405 4.774935  9.643651
## Hornet 4 Drive     0.2172534 -0.5350928 4.626013 10.488088
## Hornet Sportabout -0.2307345  0.4129422 4.324350 13.228757
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="select" tabindex="-1"><a class="header-anchor" href="#select" aria-hidden="true">#</a> select*</h4><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># pull values from the variable into a vector
mtcars %&gt;% pull(mpg)
##  [1] 21.0 21.0 22.8 21.4 18.7 18.1 14.3 24.4 22.8 19.2 17.8 16.4 17.3 15.2 10.4
## [16] 10.4 14.7 32.4 30.4 33.9 21.5 15.5 15.2 13.3 19.2 27.3 26.0 30.4 15.8 19.7
## [31] 15.0 21.4

# You can find all of them in the help file by command ?tidyselect::select_helpers
# select only variables that starts with &quot;d&quot;
mtcars %&gt;% select(starts_with(&quot;d&quot;)) %&gt;% head(5)
##                   disp drat
## Mazda RX4          160 3.90
## Mazda RX4 Wag      160 3.90
## Datsun 710         108 3.85
## Hornet 4 Drive     258 3.08
## Hornet Sportabout  360 3.15


# select only variables that ends with &quot;p&quot;
mtcars %&gt;% select(ends_with(&quot;p&quot;)) %&gt;% head(5)
##                   disp  hp
## Mazda RX4          160 110
## Mazda RX4 Wag      160 110
## Datsun 710         108  93
## Hornet 4 Drive     258 110
## Hornet Sportabout  360 175

# select only variables that contains &quot;r&quot;
mtcars %&gt;% select(contains(&quot;r&quot;)) %&gt;% head(5)
##                   drat gear carb
## Mazda RX4         3.90    4    4
## Mazda RX4 Wag     3.90    4    4
## Datsun 710        3.85    4    1
## Hornet 4 Drive    3.08    3    1
## Hornet Sportabout 3.15    3    2

# select only variables that match a regular expression
# variables containing &quot;sp&quot; or &quot;ca&quot;
mtcars %&gt;% select(matches(&quot;sp|ca&quot;)) %&gt;% head(5)
##                   disp carb
## Mazda RX4          160    4
## Mazda RX4 Wag      160    4
## Datsun 710         108    1
## Hornet 4 Drive     258    1
## Hornet Sportabout  360    2


# select variables listed in the character vector
my_vars &lt;- c(&quot;mpg&quot;, &quot;hp&quot;, &quot;am&quot;)
mtcars %&gt;% select(all_of(my_vars)) %&gt;% head(5)
##                    mpg  hp am
## Mazda RX4         21.0 110  1
## Mazda RX4 Wag     21.0 110  1
## Datsun 710        22.8  93  1
## Hornet 4 Drive    21.4 110  0
## Hornet Sportabout 18.7 175  0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Besides select_helpers functions, there are also alternatives with <code>_all()</code>, <code>_at()</code> and <code>_if()</code> – similar to <code>mutate()</code> function. You can select variables if they satisfy some criteria. You can use <code>select_at()</code> with the vector of characters listing variables of interest.</p><p>Function <code>select_all()</code> looks strange – the source data frame already has all variables, so there is no point to select them again. Well, select has some extra functionality – it can rename selected variables.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># select all variables and change their names for uppercase, then show top 5 rows only
mtcars %&gt;% select_all(toupper) %&gt;% head(5)
##                    MPG CYL DISP  HP DRAT    WT  QSEC VS AM GEAR CARB
## Mazda RX4         21.0   6  160 110 3.90 2.620 16.46  0  1    4    4
## Mazda RX4 Wag     21.0   6  160 110 3.90 2.875 17.02  0  1    4    4
## Datsun 710        22.8   4  108  93 3.85 2.320 18.61  1  1    4    1
## Hornet 4 Drive    21.4   6  258 110 3.08 3.215 19.44  1  0    3    1
## Hornet Sportabout 18.7   8  360 175 3.15 3.440 17.02  0  0    3    2
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>There is a wrapper of <code>select()</code> function that makes the task of renaming more obvious and clear – <code>rename()</code>. Both functions do a very similar job but the first one retains only selected variables while the second one keeps all variables.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>my_cols &lt;- c(&quot;hp&quot;, &quot;mpg&quot;)
# select columns listed in the vector and change names to TitleCase
mtcars %&gt;% select_at(my_cols, tools::toTitleCase) %&gt;% head(5)
##                    Hp  Mpg
## Mazda RX4         110 21.0
## Mazda RX4 Wag     110 21.0
## Datsun 710         93 22.8
## Hornet 4 Drive    110 21.4
## Hornet Sportabout 175 18.7


# change names of columns listed in the vector and keep everything else as is
mtcars %&gt;% rename_at(my_cols, tools::toTitleCase) %&gt;% head(5)
##                    Mpg cyl disp  Hp drat    wt  qsec vs am gear carb
## Mazda RX4         21.0   6  160 110 3.90 2.620 16.46  0  1    4    4
## Mazda RX4 Wag     21.0   6  160 110 3.90 2.875 17.02  0  1    4    4
## Datsun 710        22.8   4  108  93 3.85 2.320 18.61  1  1    4    1
## Hornet 4 Drive    21.4   6  258 110 3.08 3.215 19.44  1  0    3    1
## Hornet Sportabout 18.7   8  360 175 3.15 3.440 17.02  0  0    3    2
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="summarise" tabindex="-1"><a class="header-anchor" href="#summarise" aria-hidden="true">#</a> summarise*</h4><p>To aggregate all data or data in each group you can use function <code>summarise()</code> or <code>summarize()</code> if you prefer American spelling. This function was presented in the section about main functions. Similar to <code>mutate()</code><br> function there are scoped variants of <code>summarise()</code> that allows to skip providing names for all variables you want to <code>summarise/aggregate</code>.<br><code>summarise_all()</code> applies a function to all variables.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># select only three columns to make example smaller
df &lt;- mtcars %&gt;% select(mpg, cyl, hp)
# get mean and median values for every variable/column in the data frame
df %&gt;% summarise_all(list(m1 = mean, m2 = median))
##     mpg_m1 cyl_m1    hp_m1 mpg_m2 cyl_m2 hp_m2
## 1 20.09062 6.1875 146.6875   19.2      6   123
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>summarise_at()</code> apply a function to variables selected with a character vector.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># prepare a character vector with variables to analyse
my_vars &lt;- c(&quot;mpg&quot;, &quot;hp&quot;, &quot;cyl&quot;)
# get mean for each selected variable
mtcars %&gt;% summarise_at(my_vars, mean)
##        mpg       hp    cyl
## 1 20.09062 146.6875 6.1875
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>summarise_if()</code> apply a function to variables selected with a function that returns TRUE or FASLE for each variable</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># get mean for variables that function is.numeric() returns TRUE
mtcars %&gt;% summarise_if(is.numeric, mean)
##        mpg    cyl     disp       hp     drat      wt     qsec     vs      am   gear   carb
## 1 20.09062 6.1875 230.7219 146.6875 3.596563 3.21725 17.84875 0.4375 0.40625 3.6875 2.8125
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Most aggregation R functions can be used with <strong>summarise()</strong>:</p><ul><li>mean(), sd(), var(), sum()</li><li>median(), IQR() , min(), max(), quantile()</li></ul><p>There are some uniquely <strong>dplyr</strong> functions that might be handy:</p><ul><li><code>n()</code> - count number of rows</li><li><code>n_distinct()</code> - count unique values</li><li><code>first()</code>, <code>last()</code>, <code>nth()</code> – first, last and nth value in a variable/column. The result will depend on the order of rows.</li></ul><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># get a number of rows, max value in &quot;mpg&quot;, number of unique values in &quot;cyl&quot;
mtcars %&gt;% summarise(n_rows = n(), max_mpg = max(mpg), n_cyl = n_distinct(cyl))
##   n_rows max_mpg n_cyl
## 1     32    33.9     3
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="package-tidyr" tabindex="-1"><a class="header-anchor" href="#package-tidyr" aria-hidden="true">#</a> Package tidyr</h2>`,38),x=e("code",null,"tidyr",-1),M={href:"https://tydir.tidyverse.org/index.html",target:"_blank",rel:"noopener noreferrer"},D=d(`<h3 id="conversion-between-wide-and-long-tables" tabindex="-1"><a class="header-anchor" href="#conversion-between-wide-and-long-tables" aria-hidden="true">#</a> Conversion between wide and long tables</h3><p>Data we get from our clients or other sources are not always ready for analysis. It is really important to understand what are variables, observations and values in the data. This is not an obvious question. For example, below is a data set with results of religion and income survey.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># load all packages at once - dplyr, tidyr, purrr, readr and some others
library(tidyverse)
head(relig_income, 10)
## # A tibble: 10 x 11
## religion \`&lt;$10k\` \`$10-20k\` \`$20-30k\` \`$30-40k\` \`$40-50k\` \`$50-75k\` \`$75-100k\`
## &lt;chr&gt; &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt; &lt;dbl&gt;
## 1 Agnostic 27 34 60 81 76 137 122
## 2 Atheist 12 27 37 52 35 70 73
## 3 Buddhist 27 21 30 34 33 58 62
## 4 Catholic 418 617 732 670 638 1116 949
## 5 Don’t k~ 15 14 15 11 10 35 21
## 6 Evangel~ 575 869 1064 982 881 1486 949
## 7 Hindu 1 9 7 9 11 34 47
## 8 Histori~ 228 244 236 238 197 223 131
## 9 Jehovah~ 20 27 24 24 21 30 15
## 10 Jewish 19 19 25 25 30 95 69
## # ... with 3 more variables: $100-150k &lt;dbl&gt;, &gt;150k &lt;dbl&gt;,
## # Don&#39;t know/refused &lt;dbl&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>However, if you use your data understanding then you see that there are only three real variables: name of a religion, income group and number of respondents. This format of representing data (with 11 columns as above) is called “wide table”, while for a proper data analysis you need (in most cases) so-called “long table” format (with 3 columns only). Likely for you, there are multiple tools to do a conversion.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># convert wide table into a long table
# key is a name of the new variable to put original column names as values
# value is a name of the new variable to store all values from original columns
# -religion is a variable that should stay as is and not to be included in &quot;gathering&quot;
relig_income_long &lt;- gather(relig_income, key = &quot;Income&quot;, value = &quot;Counts&quot;, -religion)
# check the new data frame size - just three columns but 180 rows
# it is truely a long table
dim(relig_income_long)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Long table is good for data analysis and data visualisation. Wide table is good for reporting and for a small number of data analysis techniques. So, there is a backward conversion available.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># convert long table into a wide table
# key variable is used to create new columns
# value variable provides values for these new columns
relig_income_wide &lt;- spread(relig_income_long, key = &quot;Income&quot;, value = &quot;Counts&quot;)
# check the new data frame size - it is wide and short
dim(relig_income_wide)

# convert to long table
relig_income_long &lt;- relig_income %&gt;% pivot_longer(col = -religion, names_to = &quot;Income&quot;, values_to = &quot;Counts&quot;)
dim(relig_income_long) # check the size of the long table

# convert to wide table
relig_income_wide &lt;- relig_income_long %&gt;% pivot_wider(names_from = &quot;Income&quot;, values_from = &quot;Counts&quot;)
dim(relig_income_wide) # check the size of the wide table

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="missing-values-treatment" tabindex="-1"><a class="header-anchor" href="#missing-values-treatment" aria-hidden="true">#</a> Missing values treatment</h3><p>Very useful functionality of tidyr working well with dplyr is a treatment for missing values You can remove rows with missing values or replace them with something. For example</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># create a small data frame for the example
df &lt;- data.frame(x = c(1, 2, NA), y = c(&quot;a&quot;, NA, &quot;b&quot;), stringsAsFactors = FALSE)
df # have a look on the result - two variable &quot;x&quot; and &quot;y&quot;
##   x   y
## 1 1   a
## 2 2  &lt;NA&gt;
## 3 NA  b

df %&gt;% drop_na() # drop all rows with NA values
## x y
## 1 1 a
## 2 2 &lt;NA&gt;

# variables &quot;x&quot; and &quot;y&quot; are of different type, so we replace NA differently
df %&gt;% replace_na(list(x = 0, y = &quot;unknown&quot;))
## x y
## 1 1 a
## 2 2 unknown
## 3 0 b

# replacement for one variable only
df %&gt;% replace_na(list(x = 0))
## x y
## 1 1 a
## 2 2 &lt;NA&gt;
## 3 0 b


# alternative approach is to combine tidyr and dplyr and use replacement for a vector
# as every variable in a data frame is a vector. You can drop &quot;list&quot; here.
df %&gt;% mutate(xx = replace_na(x, 0))
## x y xx
## 1 1 a 1
## 2 2 &lt;NA&gt; 2
## 3 NA b 0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="package-purrr-great-tool-for-text-analysis" tabindex="-1"><a class="header-anchor" href="#package-purrr-great-tool-for-text-analysis" aria-hidden="true">#</a> Package purrr: Great tool for text analysis</h2>`,11),H=e("em",null,[e("strong",null,"purrr")],-1),A={href:"https://purrr/",target:"_blank",rel:"noopener noreferrer"},z={href:"http://tidyverse.org/index.html",target:"_blank",rel:"noopener noreferrer"},X=e("em",null,[e("strong",null,"dplyr")],-1),T=e("em",null,[e("strong",null,"purrr")],-1),S=e("em",null,[e("strong",null,"dplyr")],-1),j=e("br",null,null,-1),C=e("em",null,[e("strong",null,"purrr")],-1),F=d(`<p>The main function in <em><strong>purrr</strong></em> is <em><strong>map()</strong></em> and it has a large number of variants. Function <em><strong>map()</strong></em> does the same job as functions <em><strong>sapply()</strong></em> or <em><strong>lapply()</strong></em> presented previously but <em><strong>map()</strong></em> does this job way more efficient. As <em><strong>purrr</strong></em> is a part of <em><strong>tidyverse</strong></em> collection, it supports <em><strong>piping.</strong></em></p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code>1:5 %&gt;% # vector as an input
map(rnorm, n = 3) # some function applied to each element of the input vector
## [[1]]
## [1] 2.1153059 0.7227579 1.8153231
##
## [[2]]
## [1] 3.286483 1.340960 1.557657
##
## [[3]]
## [1] 2.876652 3.066912 3.075800
##
## [[4]]
## [1] 4.612661 2.392644 3.399425
##
## [[5]]
## [1] 3.522628 5.100503 5.504073
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>By default, result of function <code>map()</code> is a list. However, there are alternatives that allows to output different types of vectors and even a data frame.</p><div class="language-R line-numbers-mode" data-ext="R"><pre class="language-R"><code># prepare an input list
favorite_desserts &lt;- list(Sophia = &quot;banana bread&quot;,
Eliott = &quot;pancakes&quot;,
Karina = &quot;chocolate cake&quot;)
# apply function paste() and output a character vector
favorite_desserts %&gt;% map_chr(~ paste(.x, &quot;rocks!&quot;))
## Sophia Eliott Karina
## &quot;banana bread rocks!&quot; &quot;pancakes rocks!&quot; &quot;chocolate cake rocks!&quot;

favorite_desserts %&gt;% map_chr(function(x) paste(x, &quot;rocks!&quot;))
## Sophia Eliott Karina
## &quot;banana bread rocks!&quot; &quot;pancakes rocks!&quot; &quot;chocolate cake rocks!&quot;


mtcars %&gt;% # input is a data frame
  split(.$cyl) %&gt;% # split mtcars in three data frames
  map(~ lm(mpg ~ wt, data = .x)) %&gt;% # run linear model for each data frame
  map(summary) %&gt;% # get summary of fits for each model
  map_dbl(&quot;r.squared&quot;) # extract values of R-squared and store then as a vector
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,4);function E(W,N){const r=t("ExternalLinkIcon"),o=t("Tabs");return u(),v("div",null,[b,e("p",null,[n("First is first, a website for dplyr package - "),e("a",g,[n("https://dplyr.tidyverse.org/"),l(r)]),n(" You can find there an introduction into "),p,n(" and (the most important!) a cheat sheet with its main functions.")]),h,l(o,{id:"29",data:[{id:"filter()"},{id:"arrange()"},{id:"select()"},{id:"mutate()"},{id:"summarise()"},{id:"group_by()"}]},{title0:i(({value:a,isActive:s})=>[n("filter()")]),title1:i(({value:a,isActive:s})=>[n("arrange()")]),title2:i(({value:a,isActive:s})=>[n("select()")]),title3:i(({value:a,isActive:s})=>[n("mutate()")]),title4:i(({value:a,isActive:s})=>[n("summarise()")]),title5:i(({value:a,isActive:s})=>[n("group_by()")]),tab0:i(({value:a,isActive:s})=>[f]),tab1:i(({value:a,isActive:s})=>[y]),tab2:i(({value:a,isActive:s})=>[_]),tab3:i(({value:a,isActive:s})=>[q]),tab4:i(({value:a,isActive:s})=>[w]),tab5:i(({value:a,isActive:s})=>[R]),_:1},8,["data"]),k,e("p",null,[n("Package "),x,n(" is another package from tidyverse collection. It focuses on making data “tidy”, that is, nice and ready for analysis using other tools and dplyr in particular. Here is a web site – "),e("a",M,[n("https://tydir.tidyverse.org/index.html"),l(r)]),n(" – for the package with the introduction and cheat sheet")]),D,e("p",null,[n("One more package to mention here is "),H,n(". As usual, there is a web site for the package "),e("a",A,[n("https://purrr"),l(r)]),n("."),e("a",z,[n("tidyverse.org/index.html"),l(r)]),n(" with the introduction and cheat sheet. As "),X,n(" is a tool of choice for any kinds of data frame transformations, package "),T,n(" is an excellent tool for transformation of lists and vectors. Hence, if you work with structured or semi-structured data, which happens most of the time, you use "),S,n("."),j,n(" If you get into the area of unstructured data, for example, text analysis, then you need another tool for data transformations and "),C,n(" is great here. You will do this type of analysis later.")]),F])}const $=c(m,[["render",E],["__file","03.Data manipulation.html.vue"]]);export{$ as default};
