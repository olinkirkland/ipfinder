import React from 'react';

export default class Util {
  static toRelativeTimeStr(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(weeks / 4);
    const years = Math.floor(months / 12);

    if (years > 0) return `${years} ${years > 1 ? 'years' : 'year'} ago`;
    if (months > 0) return `${months} ${months > 1 ? 'months' : 'month'} ago`;
    if (weeks > 0) return `${weeks} ${weeks > 1 ? 'weeks' : 'week'} ago`;
    if (days > 0) return `${days} ${days > 1 ? 'days' : 'day'} ago`;
    if (hours > 0) return `${hours} ${hours > 1 ? 'hours' : 'hour'} ago`;
    if (minutes > 0)
      return `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} ago`;
    return `${seconds} ${seconds > 0 ? 'seconds' : 'second'} ago`;
  }

  static toAge(timestamp) {
    const d1 = new Date();
    const d2 = Date.parse(timestamp);
    return Util.toRelativeTimeStr(d1 - d2);
  }
}
