using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;

namespace Complish
{
	public interface IGenerateCode
	{
		void Begin(string fname);
		void WriteInt(Int32 me);
		void WriteStringTable(List<string> literalStrings);
		// other opcodes to follow
		void Finish();
	}

	public class Flash : IGenerateCode
	{
		int position;
		FileStream fp;
		int stringTableTableAt;
		int stringtablelen;
		string filename;

		public void Begin(string fname)
		{
			filename = fname + ".swf";
			fp = File.Create(filename);
			var bytes = new byte[] { (byte)'F', (byte)'W', (byte)'S', 9, 0, 0, 0, 0 }; 
			fp.Write(bytes, 0, bytes.Length);
			WriteRect(127,260,15,514);
			WriteInt((Int16)0x0001); // one frame per second
			WriteInt((Int16)1); // one frame in file
			position = 8;
		}

		public void Finish()
		{
			WriteInt(stringTableTableAt);
			Console.WriteLine("{0} bytes written to '{1}'", position, filename);
			Console.WriteLine("Stringtable at byte #{0} ({2,2:x} hex) and is {1} Int32s long.", stringTableTableAt, stringtablelen,stringTableTableAt);
			fp.Seek(4, SeekOrigin.Begin);
			WriteInt(position);
			fp.Close();
		}

		void WriteRect(int minx, int maxx, int miny, int maxy)
		{
			int log2t;
			int log2 = (int)Math.Ceiling(Math.Log(minx, 2));
			log2t = (int)Math.Ceiling(Math.Log(maxx, 2));
			if (log2t > log2) log2 = log2t;
			log2t = (int)Math.Ceiling(Math.Log(miny, 2));
			if (log2t > log2) log2 = log2t;
			log2t = (int)Math.Ceiling(Math.Log(maxy, 2));
			if (log2t > log2) log2 = log2t;
			log2++; // add a sign bit
			WritePackedByte(5, log2);
			WritePackedByte(log2, minx);
			WritePackedByte(log2, maxx);
			WritePackedByte(log2, miny);
			WritePackedByte(log2, maxy);
			WritePackedByte(8, 0);
			numBitsLeftToWrite = 0;
			//Console.WriteLine();
		}

		int theBitsLeftToWrite = 0;
		int numBitsLeftToWrite = 0;
		void WritePackedByte(int widthInBits, int value)
		{
			theBitsLeftToWrite <<= widthInBits;
			if (value > Math.Pow(2, widthInBits) - 1)
				Console.WriteLine("ERROR IN COMPILER: can't encode {0} into a bitfield {1} bits wide because it requires more bits than that to represent it", value, widthInBits  );
			theBitsLeftToWrite |= value;
			numBitsLeftToWrite += widthInBits;
			while (numBitsLeftToWrite >= 8)
			{
				byte byteToWrite = (byte)(theBitsLeftToWrite >> (numBitsLeftToWrite - 8));
				fp.WriteByte(byteToWrite);
				numBitsLeftToWrite -= 8;
				//AsBinary(byteToWrite);
			}
		}

		/*public static void AsBinary(int num)
		{
			int mask = 0x80;
			for (int i = 0; i < 8; i++)
			{
				Console.Write(((num & mask) > 0) ? '1' : '0');
				mask >>= 1;
			}
			Console.Write(' ');
		}*/

		public void WriteInt(Int32 me)
		{
			byte[] bytes = new byte[4];
			bytes[0] = (byte)(me & 0xFF);
			me >>= 8;
			bytes[1] = (byte)(me & 0xFF);
			me >>= 8;
			bytes[2] = (byte)(me & 0xFF);
			me >>= 8;
			bytes[3] = (byte)(me & 0xFF);
			fp.Write(bytes, 0, 4);
			position += 4;
		}

		void WriteInt(Int16 me)
		{
			byte[] bytes = new byte[2];
			bytes[0] = (byte)(me & 0xFF);
			me >>= 8;
			bytes[1] = (byte)(me & 0xFF);
			fp.Write(bytes, 0, 2);
			position += 2;
		}

		/// <summary>A string here is a Int32 containing the length, and then the null-terminated string.</summary>
		/// <returns>Returns a pointer (file offset) to the string</returns>
		int WriteString(string me)
		{
			var chars = me.ToCharArray();
			byte[] bytes = chars.Select(item => (byte)item).ToArray();
			WriteInt(bytes.Length);
			int retval = position;
			fp.Write(bytes, 0, chars.Length);
			fp.WriteByte(0);
			position += chars.Length + 1;
			return retval;
		}

		public void WriteStringTable(List<string> literalStrings)
		{
			var pointers = new List<Int32>(literalStrings.Count);
			stringtablelen = literalStrings.Count;
			WriteInt(stringtablelen);
			foreach (string line in literalStrings)
				pointers.Add(WriteString(line));
			stringTableTableAt = position;
			foreach (int ptr in pointers)
				WriteInt(ptr);
		}

	}

}
