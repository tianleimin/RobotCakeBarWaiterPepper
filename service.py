import qi
import os
import json
import uuid
import datetime

class SurveyService:
    def save(self, data):
        '''
        Saves survey data to unique json files
        '''
        now = datetime.datetime.now()
        data = json.loads(data)

        ## Strip out identifiable information
        if 'psych' in data and data['psych']['is_psych'] != '0':
            fname = '-'.join(['sona', str(uuid.uuid1())]) + '.json'

            with open(os.path.join('/home/nao/data/survey', fname), 'w') as f:
                f.write(json.dumps(data['psych'], indent=4, sort_keys=True) + '\n')


        if 'prize_draw' in data and data['prize_draw']['is_interested'] != '0':
            fname = '-'.join(['prize-draw', str(uuid.uuid1())]) + '.json'

            with open(os.path.join('/home/nao/data/survey', fname), 'w') as f:
                f.write(json.dumps(data['prize_draw'], indent=4, sort_keys=True) + '\n')

        if 'psych' in data:
            del data['psych']

        if 'prize_draw' in data:
            del data['prize_draw']

        ## Save santized responses
        fname = '-'.join(['response', str(now.year), str(now.month), str(now.day)]) + '.json'

        with open(os.path.join('/home/nao/data/cakebar', fname), 'w') as f:
            f.write(json.dumps(data, indent=4, sort_keys=True) + '\n')

        return True

def main():
    app = qi.Application()
    app.start()
    session = app.session

    service = SurveyService()
    session.registerService('SurveyService', service)
    app.run()



if __name__ == '__main__':
    main()
