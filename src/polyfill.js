if (Array.prototype.pop_i === undefined) {
  Array.prototype.pop_i = function (idx) {
    if (idx < 0 || idx >= this.length) {
      throw new Error("Index out of range");
    }

    while (idx < this.length) {
      this[idx] = this[idx + 1];
      idx++;
    }

    this.length -= 1;
  }
}

if (Array.prototype.remove === undefined) {
  Array.prototype.remove = function (item, suppress_error) {
    var i = this.indexOf(item);

    if (i < 0) {
      if (suppress_error)
        console.trace("Warning: item not in array", item);
      else
        throw new Error("Error: item not in array " + item);

      return;
    }

    this.pop_i(i);
  }
}

if (String.prototype.contains === undefined) {
  String.prototype.contains = function (substr) {
    return String.search(substr) != null;
  }
}
