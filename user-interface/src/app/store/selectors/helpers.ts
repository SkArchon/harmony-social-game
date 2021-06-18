import { DateTime } from 'luxon';
import { CommonUtil } from 'app/common.util';

export const getDuraionToNextDraw = (timestamp) => {
    const drawDate = DateTime.fromSeconds(timestamp);
    const response = drawDate.diff(DateTime.now(), ['days', 'hours', 'minutes', 'seconds']).values;
    return {
        days: response.days,
        hours: CommonUtil.roundPad2(response.hours),
        minutes: CommonUtil.roundPad2(response.minutes),
        seconds: CommonUtil.roundPad2(response.seconds)
    };
};


export const getIsDrawDateValuePassed = (timestamp) => {
    if (!timestamp) {
        return false;
    }
    const dateTimestamp = DateTime.fromSeconds(timestamp);
    const difference = dateTimestamp.diffNow().toObject().milliseconds;
    return difference < 0;
};
