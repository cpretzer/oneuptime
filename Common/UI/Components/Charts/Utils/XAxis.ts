import NotImplementedException from "../../../../Types/Exception/NotImplementedException";
import XAxisMaxMin from "../Types/XAxis/XAxisMaxMin";
import XAxisPrecision from "../Types/XAxis/XAxisPrecision";

export default class XAxisUtil {
    public static getPrecision(data: {
        xAxisMin: XAxisMaxMin,
        xAxisMax: XAxisMaxMin,
    }): XAxisPrecision {

        if (typeof data.xAxisMax === "number" || typeof data.xAxisMin === "number") {
            // number not yet supported. 
            throw new NotImplementedException();
        }

        const startDate: Date = data.xAxisMin;
        const endDate: Date = data.xAxisMax;

        const totalMilliseconds = endDate.getTime() - startDate.getTime();
        const totalSeconds = totalMilliseconds / 1000;
        const totalMinutes = totalSeconds / 60;
        const totalHours = totalMinutes / 60;
        const totalDays = totalHours / 24;
        const totalWeeks = totalDays / 7;
        const totalMonths = totalDays / 30;


        if (totalSeconds <= 50) return XAxisPrecision.EVERY_SECOND;
        if (totalSeconds <= 250) return XAxisPrecision.EVERY_FIVE_SECONDS;
        if (totalSeconds <= 500) return XAxisPrecision.EVERY_TEN_SECONDS;
        if (totalSeconds <= 1500) return XAxisPrecision.EVERY_THIRTY_SECONDS;
        if (totalMinutes <= 50) return XAxisPrecision.EVERY_MINUTE;
        if (totalMinutes <= 250) return XAxisPrecision.EVERY_FIVE_MINUTES;
        if (totalMinutes <= 500) return XAxisPrecision.EVERY_TEN_MINUTES;
        if (totalMinutes <= 1500) return XAxisPrecision.EVERY_THIRTY_MINUTES;
        if (totalHours <= 50) return XAxisPrecision.EVERY_HOUR;
        if (totalHours <= 100) return XAxisPrecision.EVERY_TWO_HOURS;
        if (totalHours <= 150) return XAxisPrecision.EVERY_THREE_HOURS;
        if (totalHours <= 300) return XAxisPrecision.EVERY_SIX_HOURS;
        if (totalHours <= 600) return XAxisPrecision.EVERY_TWELVE_HOURS;
        if (totalDays <= 50) return XAxisPrecision.EVERY_DAY;
        if (totalDays <= 100) return XAxisPrecision.EVERY_TWO_DAYS;
        if (totalWeeks <= 50) return XAxisPrecision.EVERY_WEEK;
        if (totalWeeks <= 100) return XAxisPrecision.EVERY_TWO_WEEKS;
        if (totalMonths <= 50) return XAxisPrecision.EVERY_MONTH;
        if (totalMonths <= 100) return XAxisPrecision.EVERY_TWO_MONTHS;
        if (totalMonths <= 150) return XAxisPrecision.EVERY_THREE_MONTHS;
        if (totalMonths <= 300) return XAxisPrecision.EVERY_SIX_MONTHS;
        return XAxisPrecision.EVERY_YEAR;

    }

    public static getPrecisionIntervals(data: {
        xAxisMin: XAxisMaxMin,
        xAxisMax: XAxisMaxMin,
    }): Array<Date> {
        const precision: XAxisPrecision = XAxisUtil.getPrecision(data);

        if (typeof data.xAxisMax === "number" || typeof data.xAxisMin === "number") {
            // number not yet supported. 
            throw new NotImplementedException();
        }

        const startDate: Date = new Date(data.xAxisMin);
        const endDate: Date = new Date(data.xAxisMax);
        const intervals: Array<Date> = [];

        let currentDate = startDate;

        while (currentDate <= endDate) {
            intervals.push(new Date(currentDate));

            switch (precision) {
                case XAxisPrecision.EVERY_SECOND:
                    currentDate.setSeconds(currentDate.getSeconds() + 1);
                    break;
                case XAxisPrecision.EVERY_FIVE_SECONDS:
                    currentDate.setSeconds(currentDate.getSeconds() + 5);
                    break;
                case XAxisPrecision.EVERY_TEN_SECONDS:
                    currentDate.setSeconds(currentDate.getSeconds() + 10);
                    break;
                case XAxisPrecision.EVERY_THIRTY_SECONDS:
                    currentDate.setSeconds(currentDate.getSeconds() + 30);
                    break;
                case XAxisPrecision.EVERY_MINUTE:
                    currentDate.setMinutes(currentDate.getMinutes() + 1);
                    break;
                case XAxisPrecision.EVERY_FIVE_MINUTES:
                    currentDate.setMinutes(currentDate.getMinutes() + 5);
                    break;
                case XAxisPrecision.EVERY_TEN_MINUTES:
                    currentDate.setMinutes(currentDate.getMinutes() + 10);
                    break;
                case XAxisPrecision.EVERY_THIRTY_MINUTES:
                    currentDate.setMinutes(currentDate.getMinutes() + 30);
                    break;
                case XAxisPrecision.EVERY_HOUR:
                    currentDate.setHours(currentDate.getHours() + 1);
                    break;
                case XAxisPrecision.EVERY_TWO_HOURS:
                    currentDate.setHours(currentDate.getHours() + 2);
                    break;
                case XAxisPrecision.EVERY_THREE_HOURS:
                    currentDate.setHours(currentDate.getHours() + 3);
                    break;
                case XAxisPrecision.EVERY_SIX_HOURS:
                    currentDate.setHours(currentDate.getHours() + 6);
                    break;
                case XAxisPrecision.EVERY_TWELVE_HOURS:
                    currentDate.setHours(currentDate.getHours() + 12);
                    break;
                case XAxisPrecision.EVERY_DAY:
                    currentDate.setDate(currentDate.getDate() + 1);
                    break;
                case XAxisPrecision.EVERY_TWO_DAYS:
                    currentDate.setDate(currentDate.getDate() + 2);
                    break;
                case XAxisPrecision.EVERY_WEEK:
                    currentDate.setDate(currentDate.getDate() + 7);
                    break;
                case XAxisPrecision.EVERY_TWO_WEEKS:
                    currentDate.setDate(currentDate.getDate() + 14);
                    break;
                case XAxisPrecision.EVERY_MONTH:
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    break;
                case XAxisPrecision.EVERY_TWO_MONTHS:
                    currentDate.setMonth(currentDate.getMonth() + 2);
                    break;
                case XAxisPrecision.EVERY_THREE_MONTHS:
                    currentDate.setMonth(currentDate.getMonth() + 3);
                    break;
                case XAxisPrecision.EVERY_SIX_MONTHS:
                    currentDate.setMonth(currentDate.getMonth() + 6);
                    break;
                case XAxisPrecision.EVERY_YEAR:
                    currentDate.setFullYear(currentDate.getFullYear() + 1);
                    break;
            }
        }

        return intervals;
    }

    public static getFormatter(data: {
        xAxisMin: XAxisMaxMin,
        xAxisMax: XAxisMaxMin,
    }): (value: Date) => string {

        const precision: XAxisPrecision = XAxisUtil.getPrecision(data);

        switch (precision) {
            case XAxisPrecision.EVERY_SECOND:
            case XAxisPrecision.EVERY_FIVE_SECONDS:
            case XAxisPrecision.EVERY_TEN_SECONDS:
            case XAxisPrecision.EVERY_THIRTY_SECONDS:
                return (value: Date) => value.toISOString().substring(11, 19); // HH:mm:ss
            case XAxisPrecision.EVERY_MINUTE:
            case XAxisPrecision.EVERY_FIVE_MINUTES:
            case XAxisPrecision.EVERY_TEN_MINUTES:
            case XAxisPrecision.EVERY_THIRTY_MINUTES:
                return (value: Date) => value.toISOString().substring(11, 16); // HH:mm
            case XAxisPrecision.EVERY_HOUR:
            case XAxisPrecision.EVERY_TWO_HOURS:
            case XAxisPrecision.EVERY_THREE_HOURS:
            case XAxisPrecision.EVERY_SIX_HOURS:
            case XAxisPrecision.EVERY_TWELVE_HOURS:
                return (value: Date) => {
                    const dateString = value.toISOString();
                    const day = dateString.substring(8, 10);
                    const month = value.toLocaleString('default', { month: 'short' });
                    const hour = dateString.substring(11, 13);
                    return `${day} ${month}, ${hour}:00`;
                }; // DD MMM, HH:00
            case XAxisPrecision.EVERY_DAY:
            case XAxisPrecision.EVERY_TWO_DAYS:
                return (value: Date) => {
                    const dateString = value.toISOString();
                    const day = dateString.substring(8, 10);
                    const month = value.toLocaleString('default', { month: 'short' });
                    return `${day} ${month}`;
                }; // DD MMM
            case XAxisPrecision.EVERY_WEEK:
            case XAxisPrecision.EVERY_TWO_WEEKS:
                return (value: Date) => {
                    const dateString = value.toISOString();
                    const day = dateString.substring(8, 10);
                    const month = value.toLocaleString('default', { month: 'short' });
                    return `${day} ${month}`;
                }; // DD MMM
            case XAxisPrecision.EVERY_MONTH:
            case XAxisPrecision.EVERY_TWO_MONTHS:
            case XAxisPrecision.EVERY_THREE_MONTHS:
            case XAxisPrecision.EVERY_SIX_MONTHS:
                return (value: Date) => {
                    const dateString = value.toISOString();
                    const day = dateString.substring(8, 10);
                    const year = dateString.substring(0, 4);
                    const month = value.toLocaleString('default', { month: 'short' });
                    return `${day} ${month} ${year}`;
                }; // DD MMM
            case XAxisPrecision.EVERY_YEAR:
                return (value: Date) => value.toISOString().substring(0, 4); // YYYY
            default:
                throw new Error("Unsupported precision");
        }
    }
}