WEIGHTS={'lifestyle':20,'cleanliness':15,'sleeping':15,'financial':15,'food':10,'social':10,'work':10,'boundaries':5}
def score_preferences(a:dict,b:dict):
    categories={}; conflicts=[]
    for key,weight in WEIGHTS.items():
        av,bv=a.get(key),b.get(key)
        if av is None or bv is None: value=60
        elif av==bv: value=100
        else:
            a_strict=a.get(f'{key}_priority')=='dealbreaker'; b_strict=b.get(f'{key}_priority')=='dealbreaker'
            if a_strict or b_strict: value=0; conflicts.append(f'{key.title()} is a dealbreaker conflict.')
            else: value=65
        categories[key]=value
    total=round(sum(categories[k]*WEIGHTS[k] for k in WEIGHTS)/100)
    positives=[k for k,v in categories.items() if v>=90]
    explanation=('Strong alignment in '+', '.join(positives[:3])+'.') if positives else 'Some preferences need a conversation.'
    if conflicts: explanation+=' '+ ' '.join(conflicts)
    return {'overall':total,'categories':categories,'dealbreakers':conflicts,'explanation':explanation}
