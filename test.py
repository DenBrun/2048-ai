import json

data = {'c2da2a9e-fa4b-11ed-be56-0242ac120002': {'best_score': 1050}}

# with open('data.txt', 'w') as f:
#     f.write(json.dumps(data))


def read():
    with open('data.txt') as f:
        print(json.load(f))


def write():
    with open('data.txt', 'w') as f:
        json.dump(data, f)


write()
