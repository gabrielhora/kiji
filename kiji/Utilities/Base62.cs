//
// jeff.key@sliver.com
//

using System;

namespace kiji.Utilities
{
	/// <summary>
	/// Struct whose numbering system consists of 0..9 a..z A..Z.  For example, "10" == 62.
	/// </summary>
	public struct Base62
	{
		private readonly long	_value;
		private string	_stringValue;
		
		public Base62(string value)
		{
			_value = 0;
			var count = 0;

			for (int i = value.Length - 1; i >= 0; i--)
			{
				var pos = (int)Math.Pow(62, count++);
				var part = 0;
				var c = value[i];
				
				if (c >= 48 && c <= 57)
				{
					part += c - 48;
				}
				else if (c >= 97 && c <= 122)
				{
					part += c - 87;
				}
				else if (c >= 65 && c <= 90)
				{
					part += c - 29;
				}
				else
				{
					throw new Exception(string.Format("The character '{0}' is not legal; only the characters 1-9, a-z and A-Z are legal.", c));
				}

				_value += part * pos;
			}

			_stringValue = value;
		}

		public Base62(long value)
		{
			_value = value;
			_stringValue = null;
		}

		private static string ConvertToString(long value)
		{
			var mod = value % 62;
			char val;

			if (mod >= 0 && mod <= 9)
			{
				val = Convert.ToChar(mod + 48);
			}
			else if (mod >= 10 && mod <= 35)
			{
				val = Convert.ToChar(mod + 87);
			}
			else if (mod >= 36 && mod <= 62)
			{
				val = Convert.ToChar(mod + 29);
			}
			else
			{
				throw new Exception();
			}

			if (value < 62)
			{
				return val.ToString();
			}
		    return ConvertToString(value / 62) + val;
		}

		public long Value
		{
			get { return _value; }
		}

		public override string ToString()
		{
		    return _stringValue ?? (_stringValue = ConvertToString(_value));
		}
	}
}
