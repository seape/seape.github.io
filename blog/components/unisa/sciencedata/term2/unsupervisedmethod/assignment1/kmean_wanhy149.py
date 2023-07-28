import math
import copy


class kmeans:
    def __init__(self, data, cluster):
        #store all original data
        self.__data__ = copy.copy(data)
        #store all informaton related clusters
        self.__centeroid__ = {}
        for i in cluster:
            self.__centeroid__[i] = {
                'oid': copy.copy(self.__data__[cluster[i]]),
                'flag': False,
                'member': []
            }
        
        # store the distance for each pt to centeroids
        self.__distance__ = {}
    
    # Get the euclidean distance between two objects
    def distance_euclidean(self, p1, p2):
        sum_square = 0
        for idx in range(len(p1)):
            sum_square += (p1[idx]-p2[idx])**2
        return math.sqrt(sum_square)
    
    def calculate_distance(self):
        distance = self.__distance__
        centeroid = self.__centeroid__
        data = self.__data__
        #calculate the distance for each point to each centeroid    
        for item in data:
            if not distance.__contains__(item):
                distance[item] = list(range(len(centeroid)))
            i = 0;
            for center in centeroid:
                distance[item][i] = self.distance_euclidean(data[item], centeroid[center]['oid'])
                i+=1
           
    # find members for each clusters           
    def allocate_clusters(self):
        distance = self.__distance__
        centeroid = self.__centeroid__
        #clear the member list for reallocating
        for k in centeroid:
            centeroid[k]['member'].clear()
            
        cluster_idx_map = self.__getClusterIndexMap__()
        
        # find the members for each cluster
        for item in distance:
            c_idx = distance[item].index(min(distance[item]))
            centeroid[cluster_idx_map[c_idx]]['member'].append(item)
    
    def update_centeroid(self):
        data = self.__data__
        centeroid = self.__centeroid__
        # update the centeroid
        for c in centeroid:
            new_oid = None
            for pt_name in centeroid[c]['member']:
                if None is new_oid:
                    new_oid = list(range(len(data[pt_name])))
                for i in range(len(data[pt_name])):
                    new_oid[i] += data[pt_name][i]
            if len(centeroid[c]['member']) == 0:
                #print(centeroid[c]['oid'])
                #print(c, centeroid[c]['member'])
                pass
            else:
                new_oid = list(map(lambda x: x/len(centeroid[c]['member']), new_oid))
                centeroid[c]['flag'] = abs(self.distance_euclidean(centeroid[c]['oid'], new_oid)) > 0.00001
                centeroid[c]['oid'] = new_oid
    
    def isContinue(self):
        ret = False
        centeroid = self.__centeroid__
        for k in centeroid:
            ret |= centeroid[k]['flag']
        return ret
    
    def __getFormatedListStr__(self, pts):
        output_str = '['
        for i in pts:
            output_str = f'{output_str}{i: 3.2f},'
        return f'{output_str[:-1]}]'
        
    def __getClusterIndexMap__(self):
        if not vars(self).__contains__('cluster_idx_map'):
            centeroid = self.__centeroid__
            self.cluster_idx_map = {}
            idx = 0
            for cluster in centeroid:
                self.cluster_idx_map[idx] = cluster
                idx += 1
        return copy.copy(self.cluster_idx_map)
    
    
    def output(self, round_num):
        distance = self.__distance__
        centeroid = self.__centeroid__
        print(f'------------------Round:{round_num} ---------------------------------')
        print('    ','------------------The distance ---------------------')
        for pt in distance:
            #output_str = '['
            #for i in distance[pt]:
            #    output_str = f'{output_str}{i: 3.2f},'
            #output_str = f'{output_str[:-1]}]'
            print('    ',pt, self.__getFormatedListStr__(distance[pt]), '----->', self.__getClusterIndexMap__()[distance[pt].index(min(distance[pt]))])
            #print('    ',pt, distance[pt])
        print('    ------------------Cluster member and oid-------------')
        for k in centeroid:
            print('    ', k, self.__getFormatedListStr__(centeroid[k]['oid']), centeroid[k]['member'])
        print('\n'*2)
    
    
    def output2(self, round_num):
        distance = self.__distance__
        centeroid = self.__centeroid__
        print('Cluster Member Count: ')
        for k in centeroid:
            #print('    ', k, self.__getFormatedListStr__(centeroid[k]['oid']), centeroid[k]['member'])
            print(' ', k, len(centeroid[k]['member']))
        print('\n'*2)
    
    def run(self):
        round = 0
        isloop = True
            
        while isloop:
            isbreak = False
            round += 1
            self.calculate_distance()
            self.allocate_clusters()
            self.update_centeroid()
            
            #self.output(round)
            
            # is break
            isloop = self.isContinue()
        
        self.output2(round)
                
#All data
#  you could add more variables for the data or just use two variables
#data = {
#  "A1": [2, 10, 7, 3],
#  "A2": [2,  5, 7, 3],
#  "A3": [8,  4, 7, 3],
#  "B1": [5,  8, 7, 3],
#  "B2": [7,  5, 7, 3],
#  "B3": [6,  4, 7, 3],
#  "C1": [1,  2, 7, 3],
#  "C2": [4,  9, 7, 3],
#}

####################################
## The data come from Homework
## you could add more variables for the data like the data above or just use two variables 
#data = {
#  "A1": [2, 10],
#  "A2": [2,  5],
#  "A3": [8,  4],
#  "B1": [5,  8],
#  "B2": [7,  5],
#  "B3": [6,  4],
#  "C1": [1,  2],
#  "C2": [4,  9],
#}
#
#
##clusters
## format: cluster name: initial centeroid from data
#cluster = {
#   'k1': 'A1',
#   'k2': 'B1',
#   'k3': 'C1'
#}
#
#kmeans(data, cluster).run()


